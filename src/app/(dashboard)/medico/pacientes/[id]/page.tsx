"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import MedicoLayout from "../../layout/MedicoLayout";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  Pill,
  FileText,
  AlertCircle,
  Edit,
  Save,
  X,
  Star,
  Droplet,
  Ruler,
  Weight,
  Cake,
  Clock,
  TrendingUp,
  TrendingDown,
  Stethoscope,
  ClipboardList,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Eye,
  Download,
  Share2,
  Printer,
  MoreVertical,
  Loader2,
  UserCheck,
  Shield,
  Zap,
  Target,
  Thermometer,
  Syringe,
  Microscope,
  HeartPulse,
  Brain,
  Bone,
  
  Wallet,
  CreditCard,
  DollarSign,
  Receipt,
  FileBarChart,
  BarChart3,
  LineChart,
  PieChart,
  Image as ImageIcon,
  Video,
  Paperclip,
  Send,
  MessageSquare,
  Bell,
  Settings,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ========================================
// TIPOS DE DATOS
// ========================================

export interface UsuarioSesion {
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

export interface Paciente {
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
  pais: string | null;
  foto_url: string | null;
  grupo_sanguineo: string;
  estado: "activo" | "inactivo" | "bloqueado" | "fallecido";
  es_vip: boolean;
  fecha_registro: string;
  ultima_consulta: string | null;
  proxima_cita: string | null;
  total_consultas: number;
  total_citas: number;
  clasificacion_riesgo: "bajo" | "medio" | "alto" | "critico" | null;
  imc: number | null;
  peso_kg: number | null;
  altura_cm: number | null;
  diagnostico_principal: string | null;
  notas_importantes: string | null;
  estado_civil: string | null;
  ocupacion: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  contacto_emergencia_relacion: string | null;
  prevision: string | null;
  numero_prevision: string | null;
}

export interface NuevaConsulta {
  fecha_hora: string;
  tipo_consulta: string;
  motivo_consulta: string;
  sintomas: string;
  examen_fisico: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}

export interface NuevoDocumento {
  tipo_documento: string;
  nombre_documento: string;
  descripcion: string;
  fecha_documento: string;
  fecha_subida: string;
  profesional_emisor: string;
  institucion: string;
  archivo: File | null;
  etiquetas: string;
  visible_paciente: boolean;
  compartir_equipo: boolean;
  documento_confidencial: boolean;
  notas: string;
}

export interface Alergia {
  id_alergia: number;
  nombre_alergeno: string;
  tipo_alergia: string;
  severidad: "leve" | "moderada" | "severa" | "critica";
  sintomas: string | null;
  fecha_diagnostico: string | null;
  notas: string | null;
  activa: boolean;
}

export interface CondicionCronica {
  id_condicion: number;
  nombre_condicion: string;
  fecha_diagnostico: string | null;
  estado: "controlada" | "en_tratamiento" | "descompensada" | "remision";
  notas: string | null;
  activa: boolean;
}

export interface Medicamento {
  id_medicamento: number;
  nombre_medicamento: string;
  dosis: string | null;
  frecuencia: string | null;
  via_administracion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  indicaciones: string | null;
  activo: boolean;
  medico_prescriptor: string | null;
}

export interface Consulta {
  id_consulta: number;
  fecha_consulta: string;
  motivo_consulta: string | null;
  diagnostico: string | null;
  tratamiento: string | null;
  observaciones: string | null;
  medico_nombre: string;
  especialidad: string | null;
  estado: "completada" | "pendiente" | "cancelada";
}

export interface SignoVital {
  id_signo: number;
  fecha_registro: string;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
  frecuencia_cardiaca: number | null;
  temperatura: number | null;
  saturacion_oxigeno: number | null;
  frecuencia_respiratoria: number | null;
  peso_kg: number | null;
  altura_cm: number | null;
  imc: number | null;
  glucosa: number | null;
  notas: string | null;
}

export interface Examen {
  id_examen: number;
  tipo_examen: string;
  nombre_examen: string;
  fecha_solicitud: string;
  fecha_realizacion: string | null;
  estado: "pendiente" | "realizado" | "cancelado";
  resultado: string | null;
  archivo_url: string | null;
  observaciones: string | null;
  medico_solicitante: string;
}

export interface Documento {
  id_documento: number;
  tipo_documento: string;
  nombre_documento: string;
  descripcion: string | null;
  fecha_subida: string;
  archivo_url: string;
  tamano_bytes: number;
  extension: string;
  subido_por: string;
}

export interface Cita {
  id_cita: number;
  fecha_hora: string;
  motivo: string | null;
  estado:
    | "programada"
    | "confirmada"
    | "completada"
    | "cancelada"
    | "no_asistio";
  tipo_cita: string | null;
  duracion_minutos: number;
  medico_nombre: string;
  especialidad: string | null;
  notas: string | null;
}

export interface EstadisticasPaciente {
  total_consultas: number;
  consultas_ultimo_mes: number;
  total_examenes: number;
  examenes_pendientes: number;
  total_medicamentos: number;
  medicamentos_activos: number;
  total_alergias: number;
  alergias_criticas: number;
  total_condiciones: number;
  condiciones_activas: number;
  proxima_cita: string | null;
  dias_desde_ultima_consulta: number | null;
  adherencia_tratamiento: number | null;
  indice_salud: number | null;
}



// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function PacienteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id_paciente = params?.id as string;

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPaciente | null>(null);

  // Datos médicos
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [condiciones, setCondiciones] = useState<CondicionCronica[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [signosVitales, setSignosVitales] = useState<SignoVital[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);

  // UI States
  const [tabActiva, setTabActiva] = useState<string>("resumen");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Modales
  const [modalNuevaAlergia, setModalNuevaAlergia] = useState(false);
  const [modalNuevaCondicion, setModalNuevaCondicion] = useState(false);
  const [modalNuevoMedicamento, setModalNuevoMedicamento] = useState(false);
  const [modalNuevaConsulta, setModalNuevaConsulta] = useState(false);
  const [modalNuevoSignoVital, setModalNuevoSignoVital] = useState(false);
  const [modalNuevoExamen, setModalNuevoExamen] = useState(false);
  const [modalNuevoDocumento, setModalNuevoDocumento] = useState(false);
  const [modalNuevaCita, setModalNuevaCita] = useState(false);

  const [panelLateralAbierto, setPanelLateralAbierto] = useState(false);
  // Agregar después de los estados existentes (línea ~100)
const [pacienteEditado, setPacienteEditado] = useState<Partial<Paciente>>({});


  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.medico && id_paciente) {
      cargarDatosPaciente();
    }
  }, [usuario, id_paciente]);

  // Inicializar fecha actual cuando se abre el modal
useEffect(() => {
  if (modalNuevaConsulta) {
    const ahora = new Date();
    const fechaHoraLocal = ahora.toISOString().slice(0, 16);
    setNuevaConsulta((prev) => ({ ...prev, fecha_hora: fechaHoraLocal }));
  }
}, [modalNuevaConsulta]);

// Inicializar fecha actual cuando se abre el modal
useEffect(() => {
  if (modalNuevoSignoVital) {
    const ahora = new Date();
    const fechaHoraLocal = ahora.toISOString().slice(0, 16);
    setNuevoSignoVital((prev) => ({ ...prev, fecha_hora: fechaHoraLocal }));
  }
}, [modalNuevoSignoVital]);


// Inicializar fecha actual cuando se abre el modal
useEffect(() => {
  if (modalNuevoExamen) {
    const hoy = new Date().toISOString().split("T")[0];
    setNuevoExamen((prev) => ({
      ...prev,
      fecha_solicitud: hoy,
      medico_solicitante: usuario?.medico
        ? `${usuario.nombre} ${usuario.apellido_paterno}`
        : "",
    }));
  }
}, [modalNuevoExamen, usuario]);

// Inicializar fecha actual cuando se abre el modal
useEffect(() => {
  if (modalNuevoDocumento) {
    const hoy = new Date().toISOString().split("T")[0];
    setNuevoDocumento((prev) => ({
      ...prev,
      fecha_documento: hoy,
      fecha_subida: hoy,
      profesional_emisor: usuario?.medico
        ? `${usuario.nombre} ${usuario.apellido_paterno}`
        : "",
      institucion: usuario?.medico?.centro_principal?.nombre || "",
    }));
  }
}, [modalNuevoDocumento, usuario]);

// Inicializar datos cuando se abre el modal
// Inicializar datos cuando se abre el modal
useEffect(() => {
  if (modalNuevaCita) {
    const hoy = new Date().toISOString().split("T")[0];
    setNuevaCita((prev) => ({
      ...prev,
      fecha: hoy,
      medico_nombre: usuario?.medico
        ? `${usuario.nombre} ${usuario.apellido_paterno}`
        : "",
      especialidad: usuario?.medico?.especialidades?.[0]?.nombre || "",
    }));
  }
}, [modalNuevaCita, usuario]);

// Agregar después de los useEffect existentes (línea ~150 aprox)

// Inicializar datos editables cuando se activa el modo edición
useEffect(() => {
  if (modoEdicion && paciente) {
    setPacienteEditado({
      nombre: paciente.nombre,
      apellido_paterno: paciente.apellido_paterno,
      apellido_materno: paciente.apellido_materno,
      rut: paciente.rut,
      fecha_nacimiento: paciente.fecha_nacimiento,
      genero: paciente.genero,
      email: paciente.email,
      telefono: paciente.telefono,
      celular: paciente.celular,
      direccion: paciente.direccion,
      ciudad: paciente.ciudad,
      region: paciente.region,
      estado_civil: paciente.estado_civil,
      ocupacion: paciente.ocupacion,
      prevision: paciente.prevision,
      numero_prevision: paciente.numero_prevision,
      grupo_sanguineo: paciente.grupo_sanguineo,
      contacto_emergencia_nombre: paciente.contacto_emergencia_nombre,
      contacto_emergencia_telefono: paciente.contacto_emergencia_telefono,
      contacto_emergencia_relacion: paciente.contacto_emergencia_relacion,
      peso_kg: paciente.peso_kg,
      altura_cm: paciente.altura_cm,
      diagnostico_principal: paciente.diagnostico_principal,
      notas_importantes: paciente.notas_importantes,
    });
  }
}, [modoEdicion, paciente]);






  // ========================================
  // FUNCIONES DE CARGA
  // ========================================

  // Agregar después de handleGuardarCita (línea ~250 aprox)

/**
 * Función para guardar los cambios del paciente
 */
const handleGuardarPaciente = async () => {
  try {
    setGuardando(true);

    // Validaciones básicas
    if (!pacienteEditado.nombre || !pacienteEditado.apellido_paterno) {
      alert("❌ El nombre y apellido paterno son obligatorios");
      return;
    }

    // Validar RUT si fue modificado
    if (pacienteEditado.rut && pacienteEditado.rut !== paciente?.rut) {
      const rutRegex = /^[0-9]+-[0-9kK]{1}$/;
      if (!rutRegex.test(pacienteEditado.rut)) {
        alert("❌ Formato de RUT inválido. Debe ser: 12345678-9");
        return;
      }
    }

    // Validar email si fue proporcionado
    if (pacienteEditado.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(pacienteEditado.email)) {
        alert("❌ Formato de email inválido");
        return;
      }
    }

    // Preparar datos para enviar (solo campos modificados)
    const datosActualizados = {
      ...pacienteEditado,
      id_paciente: id_paciente,
    };

    const response = await fetch(`/api/medico/pacientes/${id_paciente}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(datosActualizados),
    });

    if (response.ok) {
      const result = await response.json();
      
      alert("✅ Datos del paciente actualizados exitosamente");
      
      // Actualizar estado local del paciente
      setPaciente((prev) => ({
        ...prev!,
        ...pacienteEditado,
      }));
      
      // Salir del modo edición
      setModoEdicion(false);
      
      // Limpiar datos editados
      setPacienteEditado({});
      
      // Recargar datos completos
      cargarDatosPaciente();
    } else {
      const errorData = await response.json();
      alert(`❌ Error al actualizar paciente: ${errorData.message || "Error desconocido"}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión al actualizar paciente");
  } finally {
    setGuardando(false);
  }
};


  // Función para guardar examen
const handleGuardarExamen = async () => {
  try {
    setGuardando(true);

    // Validaciones básicas
    if (
      !nuevoExamen.tipo_examen ||
      !nuevoExamen.nombre_examen ||
      !nuevoExamen.fecha_solicitud ||
      !nuevoExamen.indicaciones
    ) {
      alert("Por favor complete todos los campos obligatorios (*)");
      return;
    }

    const response = await fetch(
      `/api/medico/pacientes/${id_paciente}/examenes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...nuevoExamen,
          id_paciente: id_paciente,
        }),
      }
    );

    if (response.ok) {
      alert("✅ Examen registrado exitosamente");
      setModalNuevoExamen(false);
      // Resetear formulario
      setNuevoExamen({
        tipo_examen: "",
        nombre_examen: "",
        fecha_solicitud: "",
        fecha_realizacion: "",
        prioridad: "normal",
        estado: "pendiente",
        indicaciones: "",
        resultado: "",
        observaciones: "",
        lugar_realizacion: "",
        medico_solicitante: "",
        requiere_ayuno: false,
        suspender_medicamentos: false,
        hidratacion_previa: false,
      });
      // Recargar datos
      cargarDatosPaciente();
    } else {
      const errorData = await response.json();
      alert(
        `❌ Error al guardar examen: ${
          errorData.message || "Error desconocido"
        }`
      );
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión al guardar examen");
  } finally {
    setGuardando(false);
  }
};

// Función para guardar cita
const handleGuardarCita = async () => {
  try {
    setGuardando(true);

    // Validaciones básicas
    if (
      !nuevaCita.tipo_cita ||
      !nuevaCita.fecha ||
      !nuevaCita.hora ||
      !nuevaCita.duracion_minutos ||
      !nuevaCita.medico_nombre ||
      !nuevaCita.motivo
    ) {
      alert("Por favor complete todos los campos obligatorios (*)");
      return;
    }

    // Validación específica para telemedicina
    if (nuevaCita.tipo_cita === "telemedicina" && !nuevaCita.proveedor_telemedicina) {
      alert("Por favor seleccione un proveedor de telemedicina");
      return;
    }

    // Combinar fecha y hora
    const fecha_hora = `${nuevaCita.fecha}T${nuevaCita.hora}:00`;

    // Preparar datos para enviar
    const citaData = {
      ...nuevaCita,
      fecha_hora: fecha_hora,
      id_paciente: id_paciente,
      id_profesional: usuario?.medico?.id_profesional,
      id_centro: usuario?.medico?.id_centro_principal,
    };

    const response = await fetch(`/api/medico/pacientes/${id_paciente}/citas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(citaData),
    });

    if (response.ok) {
      const result = await response.json();
      
      alert(
        `✅ Cita agendada exitosamente${
          nuevaCita.tipo_cita === "telemedicina"
            ? "\n\n🎥 Se ha generado el enlace de videollamada y se enviará al paciente."
            : ""
        }`
      );
      
      setModalNuevaCita(false);
      
      // Resetear formulario
      setNuevaCita({
        tipo_cita: "",
        fecha: "",
        hora: "",
        duracion_minutos: "30",
        medico_nombre: "",
        especialidad: "",
        motivo: "",
        estado: "programada",
        notas: "",
        proveedor_telemedicina: "",
        requiere_sala_virtual: false,
        url_sala_virtual: "",
        grabar_sesion: true,
        enviar_recordatorio_telemedicina: true,
        sala_espera_virtual: true,
        enviar_recordatorio_email: true,
        enviar_recordatorio_sms: true,
        enviar_recordatorio_whatsapp: false,
        tiempo_recordatorio: "1440",
      });
      
      // Recargar datos
      cargarDatosPaciente();
    } else {
      const errorData = await response.json();
      alert(`❌ Error al agendar cita: ${errorData.message || "Error desconocido"}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión al agendar cita");
  } finally {
    setGuardando(false);
  }
};









  // Función para guardar signos vitales
const handleGuardarSignoVital = async () => {
  try {
    setGuardando(true);

    // Validación básica
    if (!nuevoSignoVital.fecha_hora) {
      alert("Por favor ingrese la fecha y hora del registro");
      return;
    }

    // Calcular IMC si hay peso y altura
    let imc = null;
    if (nuevoSignoVital.peso && nuevoSignoVital.altura) {
      const pesoNum = parseFloat(nuevoSignoVital.peso);
      const alturaNum = parseFloat(nuevoSignoVital.altura) / 100; // convertir a metros
      imc = (pesoNum / Math.pow(alturaNum, 2)).toFixed(2);
    }

    const response = await fetch(
      `/api/medico/pacientes/${id_paciente}/signos-vitales`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...nuevoSignoVital,
          imc: imc,
          id_paciente: id_paciente,
        }),
      }
    );

    if (response.ok) {
      alert("✅ Signos vitales guardados exitosamente");
      setModalNuevoSignoVital(false);
      // Resetear formulario
      setNuevoSignoVital({
        fecha_hora: "",
        presion_sistolica: "",
        presion_diastolica: "",
        frecuencia_cardiaca: "",
        frecuencia_respiratoria: "",
        temperatura: "",
        saturacion_oxigeno: "",
        peso: "",
        altura: "",
        glucosa: "",
        observaciones: "",
      });
      // Recargar datos
      cargarDatosPaciente();
    } else {
      const errorData = await response.json();
      alert(
        `❌ Error al guardar signos vitales: ${
          errorData.message || "Error desconocido"
        }`
      );
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión al guardar signos vitales");
  } finally {
    setGuardando(false);
  }
};


  // Función para guardar nueva consulta
const handleGuardarConsulta = async () => {
  try {
    setGuardando(true);

    // Validaciones básicas
    if (
      !nuevaConsulta.fecha_hora ||
      !nuevaConsulta.tipo_consulta ||
      !nuevaConsulta.motivo_consulta ||
      !nuevaConsulta.diagnostico
    ) {
      alert("Por favor complete todos los campos obligatorios (*)");
      return;
    }

    const response = await fetch(`/api/medico/pacientes/${id_paciente}/consultas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...nuevaConsulta,
        id_paciente: id_paciente,
      }),
    });

    if (response.ok) {
      alert("✅ Consulta guardada exitosamente");
      setModalNuevaConsulta(false);
      // Resetear formulario
      setNuevaConsulta({
        fecha_hora: "",
        tipo_consulta: "",
        motivo_consulta: "",
        sintomas: "",
        examen_fisico: "",
        diagnostico: "",
        tratamiento: "",
        observaciones: "",
      });
      // Recargar datos
      cargarDatosPaciente();
    } else {
      const errorData = await response.json();
      alert(`❌ Error al guardar la consulta: ${errorData.message || "Error desconocido"}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión al guardar la consulta");
  } finally {
    setGuardando(false);
  }
};

// Función para manejar cambio de archivo
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validar tamaño (10 MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      alert("❌ El archivo es demasiado grande. Tamaño máximo: 10 MB");
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("❌ Tipo de archivo no permitido");
      return;
    }

    setNuevoDocumento({ ...nuevoDocumento, archivo: file });
  }
};


// Función para guardar documento
const handleGuardarDocumento = async () => {
  try {
    setGuardando(true);

    // Validaciones básicas
    if (
      !nuevoDocumento.tipo_documento ||
      !nuevoDocumento.nombre_documento ||
      !nuevoDocumento.fecha_documento ||
      !nuevoDocumento.archivo
    ) {
      alert("Por favor complete todos los campos obligatorios (*)");
      return;
    }

    // Crear FormData para subir archivo
    const formData = new FormData();
    formData.append("archivo", nuevoDocumento.archivo);
    formData.append("tipo_documento", nuevoDocumento.tipo_documento);
    formData.append("nombre_documento", nuevoDocumento.nombre_documento);
    formData.append("descripcion", nuevoDocumento.descripcion);
    formData.append("fecha_documento", nuevoDocumento.fecha_documento);
    formData.append("profesional_emisor", nuevoDocumento.profesional_emisor);
    formData.append("institucion", nuevoDocumento.institucion);
    formData.append("etiquetas", nuevoDocumento.etiquetas);
    formData.append(
      "visible_paciente",
      nuevoDocumento.visible_paciente.toString()
    );
    formData.append(
      "compartir_equipo",
      nuevoDocumento.compartir_equipo.toString()
    );
    formData.append(
      "documento_confidencial",
      nuevoDocumento.documento_confidencial.toString()
    );
    formData.append("notas", nuevoDocumento.notas);
    formData.append("id_paciente", id_paciente);

    const response = await fetch(
      `/api/medico/pacientes/${id_paciente}/documentos`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    if (response.ok) {
      alert("✅ Documento subido exitosamente");
      setModalNuevoDocumento(false);
      // Resetear formulario
      setNuevoDocumento({
        tipo_documento: "",
        nombre_documento: "",
        descripcion: "",
        fecha_documento: "",
        fecha_subida: "",
        profesional_emisor: "",
        institucion: "",
        archivo: null,
        etiquetas: "",
        visible_paciente: true,
        compartir_equipo: true,
        documento_confidencial: false,
        notas: "",
      });
      // Recargar datos
      cargarDatosPaciente();
    } else {
      const errorData = await response.json();
      alert(
        `❌ Error al subir documento: ${
          errorData.message || "Error desconocido"
        }`
      );
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión al subir documento");
  } finally {
    setGuardando(false);
  }
};


// Estado para Nuevo Documento
// Estado para Nuevo Documento
const [nuevoDocumento, setNuevoDocumento] = useState<NuevoDocumento>({
  tipo_documento: "",
  nombre_documento: "",
  descripcion: "",
  fecha_documento: "",
  fecha_subida: "",
  profesional_emisor: "",
  institucion: "",
  archivo: null as File | null,  // ← Especifica el tipo explícitamente
  etiquetas: "",
  visible_paciente: true,
  compartir_equipo: true,
  documento_confidencial: false,
  notas: "",
});

// Ref para el input de archivo
const fileInputRef = useRef<HTMLInputElement>(null);

// Estado para Nueva Cita
const [nuevaCita, setNuevaCita] = useState({
  tipo_cita: "",
  fecha: "",
  hora: "",
  duracion_minutos: "30",
  medico_nombre: "",
  especialidad: "",
  motivo: "",
  estado: "programada",
  notas: "",
  // Telemedicina
  proveedor_telemedicina: "",
  requiere_sala_virtual: false,
  url_sala_virtual: "",
  grabar_sesion: true,
  enviar_recordatorio_telemedicina: true,
  sala_espera_virtual: true,
  // Recordatorios
  enviar_recordatorio_email: true,
  enviar_recordatorio_sms: true,
  enviar_recordatorio_whatsapp: false,
  tiempo_recordatorio: "1440", // 1 día antes por defecto
});




// Estado para Nuevo Examen
const [nuevoExamen, setNuevoExamen] = useState({
  tipo_examen: "",
  nombre_examen: "",
  fecha_solicitud: "",
  fecha_realizacion: "",
  prioridad: "normal",
  estado: "pendiente",
  indicaciones: "",
  resultado: "",
  observaciones: "",
  lugar_realizacion: "",
  medico_solicitante: "",
  requiere_ayuno: false,
  suspender_medicamentos: false,
  hidratacion_previa: false,
});

// Estado para Nuevo Signo Vital
const [nuevoSignoVital, setNuevoSignoVital] = useState({
  fecha_hora: "",
  presion_sistolica: "",
  presion_diastolica: "",
  frecuencia_cardiaca: "",
  frecuencia_respiratoria: "",
  temperatura: "",
  saturacion_oxigeno: "",
  peso: "",
  altura: "",
  glucosa: "",
  observaciones: "",
});



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

  const cargarDatosPaciente = async () => {
  try {
    setLoadingData(true);

    // ========================================
    // 1. CARGAR DATOS DEL PACIENTE
    // ========================================
    const resPaciente = await fetch(`/api/medico/pacientes/${id_paciente}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!resPaciente.ok) {
      throw new Error(`Error HTTP: ${resPaciente.status}`);
    }

    /**
 * Helper para procesar respuestas de API de forma segura
 */
const procesarRespuestaAPI = async <T,>(
  promise: PromiseSettledResult<Response>,
  nombreRecurso: string,
  normalizarDatos?: (data: any) => T
): Promise<T | null> => {
  if (promise.status === "fulfilled" && promise.value.ok) {
    try {
      const data = await promise.value.json();
      const resultado = data[nombreRecurso] || [];
      return normalizarDatos ? normalizarDatos(resultado) : resultado;
    } catch (error) {
      console.error(`Error al parsear ${nombreRecurso}:`, error);
      return null;
    }
  } else {
    console.warn(`No se pudieron cargar ${nombreRecurso}`);
    return null;
  }
};

/**
 * Normaliza valores numéricos que pueden venir como strings
 */
const normalizarNumero = (valor: any): number | null => {
  if (valor === null || valor === undefined) return null;
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return isNaN(num) ? null : num;
};


    const dataPaciente = await resPaciente.json();

    if (!dataPaciente.success) {
      alert(dataPaciente.message || "Error al cargar datos del paciente");
      router.push("/medico/pacientes");
      return;
    }

    // ✅ NORMALIZAR DATOS NUMÉRICOS DEL PACIENTE
    const pacienteNormalizado = {
      ...dataPaciente.paciente,
      // Convertir valores numéricos que pueden venir como strings
      peso_kg: dataPaciente.paciente.peso_kg 
        ? parseFloat(dataPaciente.paciente.peso_kg) 
        : null,
      altura_cm: dataPaciente.paciente.altura_cm 
        ? parseFloat(dataPaciente.paciente.altura_cm) 
        : null,
      imc: dataPaciente.paciente.imc 
        ? parseFloat(dataPaciente.paciente.imc) 
        : null,
    };

    setPaciente(pacienteNormalizado);
    setEstadisticas(dataPaciente.estadisticas || null);

    // ========================================
    // 2. CARGAR DATOS ADICIONALES EN PARALELO
    // ========================================
    const [
      resAlergias,
      resCondiciones,
      resMedicamentos,
      resConsultas,
      resSignos,
      resExamenes,
      resDocumentos,
      resCitas,
    ] = await Promise.allSettled([
      fetch(`/api/medico/pacientes/${id_paciente}/alergias`, {
        credentials: "include",
      }),
      fetch(`/api/medico/pacientes/${id_paciente}/condiciones`, {
        credentials: "include",
      }),
      fetch(`/api/medico/pacientes/${id_paciente}/medicamentos`, {
        credentials: "include",
      }),
      fetch(`/api/medico/pacientes/${id_paciente}/consultas`, {
        credentials: "include",
      }),
      fetch(`/api/medico/pacientes/${id_paciente}/signos-vitales`, {
        credentials: "include",
      }),
      fetch(`/api/medico/pacientes/${id_paciente}/examenes`, {
        credentials: "include",
      }),
      fetch(`/api/medico/pacientes/${id_paciente}/documentos`, {
        credentials: "include",
      }),
      fetch(`/api/medico/pacientes/${id_paciente}/citas`, {
        credentials: "include",
      }),
    ]);

    // ========================================
    // 3. PROCESAR ALERGIAS
    // ========================================
    if (resAlergias.status === "fulfilled" && resAlergias.value.ok) {
      try {
        const dataAlergias = await resAlergias.value.json();
        setAlergias(dataAlergias.alergias || []);
      } catch (error) {
        console.error("Error al parsear alergias:", error);
        setAlergias([]);
      }
    } else {
      console.warn("No se pudieron cargar las alergias");
      setAlergias([]);
    }

    // ========================================
    // 4. PROCESAR CONDICIONES CRÓNICAS
    // ========================================
    if (resCondiciones.status === "fulfilled" && resCondiciones.value.ok) {
      try {
        const dataCondiciones = await resCondiciones.value.json();
        setCondiciones(dataCondiciones.condiciones || []);
      } catch (error) {
        console.error("Error al parsear condiciones:", error);
        setCondiciones([]);
      }
    } else {
      console.warn("No se pudieron cargar las condiciones");
      setCondiciones([]);
    }

    // ========================================
    // 5. PROCESAR MEDICAMENTOS
    // ========================================
    if (resMedicamentos.status === "fulfilled" && resMedicamentos.value.ok) {
      try {
        const dataMedicamentos = await resMedicamentos.value.json();
        setMedicamentos(dataMedicamentos.medicamentos || []);
      } catch (error) {
        console.error("Error al parsear medicamentos:", error);
        setMedicamentos([]);
      }
    } else {
      console.warn("No se pudieron cargar los medicamentos");
      setMedicamentos([]);
    }

    // ========================================
    // 6. PROCESAR CONSULTAS
    // ========================================
    if (resConsultas.status === "fulfilled" && resConsultas.value.ok) {
      try {
        const dataConsultas = await resConsultas.value.json();
        setConsultas(dataConsultas.consultas || []);
      } catch (error) {
        console.error("Error al parsear consultas:", error);
        setConsultas([]);
      }
    } else {
      console.warn("No se pudieron cargar las consultas");
      setConsultas([]);
    }

    // ========================================
    // 7. PROCESAR SIGNOS VITALES
    // ========================================
    if (resSignos.status === "fulfilled" && resSignos.value.ok) {
      try {
        const dataSignos = await resSignos.value.json();
        // ✅ NORMALIZAR VALORES NUMÉRICOS DE SIGNOS VITALES
        const signosNormalizados = (dataSignos.signos || []).map((signo: any) => ({
          ...signo,
          valor: signo.valor ? parseFloat(signo.valor) : null,
        }));
        setSignosVitales(signosNormalizados);
      } catch (error) {
        console.error("Error al parsear signos vitales:", error);
        setSignosVitales([]);
      }
    } else {
      console.warn("No se pudieron cargar los signos vitales");
      setSignosVitales([]);
    }

    // ========================================
    // 8. PROCESAR EXÁMENES
    // ========================================
    if (resExamenes.status === "fulfilled" && resExamenes.value.ok) {
      try {
        const dataExamenes = await resExamenes.value.json();
        setExamenes(dataExamenes.examenes || []);
      } catch (error) {
        console.error("Error al parsear exámenes:", error);
        setExamenes([]);
      }
    } else {
      console.warn("No se pudieron cargar los exámenes");
      setExamenes([]);
    }

    // ========================================
    // 9. PROCESAR DOCUMENTOS
    // ========================================
    if (resDocumentos.status === "fulfilled" && resDocumentos.value.ok) {
      try {
        const dataDocumentos = await resDocumentos.value.json();
        setDocumentos(dataDocumentos.documentos || []);
      } catch (error) {
        console.error("Error al parsear documentos:", error);
        setDocumentos([]);
      }
    } else {
      console.warn("No se pudieron cargar los documentos");
      setDocumentos([]);
    }

    // ========================================
    // 10. PROCESAR CITAS
    // ========================================
    if (resCitas.status === "fulfilled" && resCitas.value.ok) {
      try {
        const dataCitas = await resCitas.value.json();
        setCitas(dataCitas.citas || []);
      } catch (error) {
        console.error("Error al parsear citas:", error);
        setCitas([]);
      }
    } else {
      console.warn("No se pudieron cargar las citas");
      setCitas([]);
    }

  } catch (error) {
    console.error("Error crítico al cargar datos del paciente:", error);
    
    // Mensaje de error más descriptivo
    const errorMessage = error instanceof Error 
      ? `Error: ${error.message}` 
      : "Error desconocido al cargar información del paciente";
    
    alert(errorMessage);
    
    // No redirigir automáticamente en caso de error de red
    // router.push("/medico/pacientes");
  } finally {
    setLoadingData(false);
  }
};


  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  // Estado para Nueva Consulta
const [nuevaConsulta, setNuevaConsulta] = useState({
  fecha_hora: "",
  tipo_consulta: "",
  motivo_consulta: "",
  sintomas: "",
  examen_fisico: "",
  diagnostico: "",
  tratamiento: "",
  observaciones: "",
});

  const obtenerColorEstado = (estado: string) => {
    const colores: { [key: string]: string } = {
      activo: "bg-green-500/20 text-green-400 border-green-500/30",
      inactivo: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      bloqueado: "bg-red-500/20 text-red-400 border-red-500/30",
      fallecido: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colores[estado] || colores.activo;
  };

  const obtenerColorRiesgo = (riesgo: string | null) => {
    const colores: { [key: string]: string } = {
      bajo: "bg-green-500/20 text-green-400 border-green-500/30",
      medio: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      alto: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      critico: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colores[riesgo || ""] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const obtenerColorSeveridad = (severidad: string) => {
    const colores: { [key: string]: string } = {
      leve: "bg-blue-500/20 text-blue-400",
      moderada: "bg-yellow-500/20 text-yellow-400",
      severa: "bg-orange-500/20 text-orange-400",
      critica: "bg-red-500/20 text-red-400",
    };
    return colores[severidad] || colores.leve;
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearFechaHora = (fecha: string | null) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleString("es-CL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const obtenerIMCCategoria = (imc: number | null) => {
    if (!imc) return { texto: "N/A", color: "text-gray-400" };
    if (imc < 18.5) return { texto: "Bajo peso", color: "text-blue-400" };
    if (imc < 25) return { texto: "Normal", color: "text-green-400" };
    if (imc < 30) return { texto: "Sobrepeso", color: "text-yellow-400" };
    if (imc < 35) return { texto: "Obesidad I", color: "text-orange-400" };
    if (imc < 40) return { texto: "Obesidad II", color: "text-red-400" };
    return { texto: "Obesidad III", color: "text-red-600" };
  };

  const obtenerIconoTab = (tab: string) => {
    const iconos: { [key: string]: any } = {
      resumen: Activity,
      historia: FileText,
      alergias: AlertCircle,
      condiciones: Heart,
      medicamentos: Pill,
      consultas: Stethoscope,
      signos: HeartPulse,
      examenes: Microscope,
      documentos: FileCheck,
      citas: Calendar,
      facturacion: Wallet,
    };
    return iconos[tab] || Activity;
  };

  // ========================================
  // RENDER LOADING
  // ========================================

  if (loading || loadingData) {
    return (
      <MedicoLayout>
       <main className="min-h-screen bg-[#f3f5ff] pt-20 md:pt-28 pb-6 md:pb-10 px-4 md:px-6 lg:px-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-black mb-4 text-gray-900">
                Cargando información del paciente...
              </h2>
            </div>
          </div>
        </main>
      </MedicoLayout>
    );
  }

  if (!paciente) {
    return (
      <MedicoLayout>
       <main className="min-h-screen bg-[#f3f5ff] pt-20 md:pt-28 pb-6 md:pb-10 px-4 md:px-6 lg:px-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md mx-auto p-8 rounded-3xl bg-white shadow-2xl border border-gray-200">
              <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-black mb-4 text-gray-900">Paciente No Encontrado</h2>
              <Link
                href="/medico/pacientes"
                className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver a Pacientes
              </Link>
            </div>
          </div>
        </main>
      </MedicoLayout>
    );
  }

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  const imcInfo = obtenerIMCCategoria(paciente.imc);

  return (
    <MedicoLayout>
       <main className="min-h-screen bg-[#f3f5ff] pt-20 md:pt-28 pb-6 md:pb-10 px-4 md:px-6 lg:px-6">
        <div className="max-w-7xl mx-auto w-full">
          {/* HEADER CON BOTÓN VOLVER */}
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => router.push("/medico/pacientes")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-300 hover:scale-105 shadow-sm mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Pacientes
            </button>

            {/* CARD DE PERFIL DEL PACIENTE */}
            <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white border border-gray-200 shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 md:gap-8">
                {/* FOTO Y DATOS BÁSICOS */}
                <div className="flex items-start gap-4 md:gap-6 flex-1 min-w-0 w-full lg:w-auto">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-4xl md:text-5xl shadow-2xl">
                      {paciente.foto_url ? (
                        <Image
                          src={paciente.foto_url}
                          alt={paciente.nombre_completo}
                          width={128}
                          height={128}
                          className="rounded-2xl md:rounded-3xl object-cover w-full h-full"
                        />
                      ) : (
                        `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`
                      )}
                    </div>
                    {paciente.es_vip && (
                      <div className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Star className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 mb-3">
                      <h1 className="text-2xl md:text-4xl font-black text-gray-900 truncate">
                        {paciente.nombre_completo}
                      </h1>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                            paciente.estado
                          )}`}
                        >
                          {paciente.estado}
                        </span>
                        {paciente.clasificacion_riesgo && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorRiesgo(
                              paciente.clasificacion_riesgo
                            )}`}
                          >
                            Riesgo {paciente.clasificacion_riesgo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                      <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-600">
                        <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span className="truncate">RUT: {paciente.rut}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-600">
                        <Cake className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span className="truncate">{paciente.edad} años</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-600">
                        <Droplet className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="truncate">{paciente.grupo_sanguineo}</span>
                      </div>
                      {paciente.telefono && (
                        <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-600">
                          <Phone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{paciente.telefono}</span>
                        </div>
                      )}
                      {paciente.email && (
                        <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-600">
                          <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{paciente.email}</span>
                        </div>
                      )}
                      {paciente.ciudad && (
                        <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-600">
                          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{paciente.ciudad}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
                  <button
  onClick={() => {
    if (modoEdicion) {
      // Si está en modo edición, guardar cambios
      handleGuardarPaciente();
    } else {
      // Si no está en modo edición, activarlo
      setModoEdicion(true);
    }
  }}
  disabled={guardando}
  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow"
>
  {guardando ? (
    <>
      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
      <span className="hidden sm:inline">Guardando...</span>
    </>
  ) : modoEdicion ? (
    <>
      <Save className="w-4 h-4 md:w-5 md:h-5" />
      <span className="hidden sm:inline">Guardar</span>
    </>
  ) : (
    <>
      <Edit className="w-4 h-4 md:w-5 md:h-5" />
      <span className="hidden sm:inline">Editar</span>
    </>
  )}
</button>

{/* Botón Cancelar (solo visible en modo edición) */}
{modoEdicion && (
  <button
    onClick={() => {
      setModoEdicion(false);
      setPacienteEditado({});
    }}
    disabled={guardando}
    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow border border-gray-300"
  >
    <X className="w-4 h-4 md:w-5 md:h-5" />
    <span className="hidden sm:inline">Cancelar</span>
  </button>
)}

                  <button
                    onClick={() => window.print()}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow border border-gray-200"
                  >
                    <Printer className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Imprimir</span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setMenuAbierto(!menuAbierto)}
                      className="p-2.5 md:p-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 transition-all duration-300 hover:scale-105 shadow border border-gray-200"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {menuAbierto && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border border-gray-200 shadow-xl z-50 overflow-hidden">
                        <button className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Share2 className="w-4 h-4" />
                          Compartir
                        </button>
                        <button className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Exportar PDF
                        </button>
                        <button className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          Notificaciones
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ESTADÍSTICAS RÁPIDAS */}
          {estadisticas && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl md:text-3xl font-black mb-1 text-gray-900">
                  {estadisticas.total_consultas}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Consultas
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Pill className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl md:text-3xl font-black mb-1 text-gray-900">
                  {estadisticas.medicamentos_activos}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Medicamentos
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl md:text-3xl font-black mb-1 text-gray-900">
                  {estadisticas.total_alergias}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Alergias
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <HeartPulse className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl md:text-3xl font-black mb-1 text-gray-900">
                  {estadisticas.condiciones_activas}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Condiciones
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Microscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <Target className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl md:text-3xl font-black mb-1 text-gray-900">
                  {estadisticas.examenes_pendientes}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Exámenes
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl md:text-3xl font-black mb-1 text-gray-900">
                  {citas.filter((c) => c.estado === "programada" || c.estado === "confirmada").length}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Citas
                </div>
              </div>
            </div>
          )}

          {/* TABS DE NAVEGACIÓN */}
          <div className="mb-6 md:mb-8">
            <div className="rounded-xl md:rounded-2xl p-2 md:p-3 bg-white border border-gray-200 shadow-lg overflow-x-auto">
              <div className="flex items-center gap-1 md:gap-2 min-w-max">
                {[
                  { id: "resumen", label: "Resumen", icon: Activity },
                  { id: "historia", label: "Historia Clínica", icon: FileText },
                  { id: "alergias", label: "Alergias", icon: AlertCircle },
                  { id: "condiciones", label: "Condiciones", icon: Heart },
                  { id: "medicamentos", label: "Medicamentos", icon: Pill },
                  { id: "consultas", label: "Consultas", icon: Stethoscope },
                  { id: "signos", label: "Signos Vitales", icon: HeartPulse },
                  { id: "examenes", label: "Exámenes", icon: Microscope },
                  { id: "documentos", label: "Documentos", icon: FileCheck },
                  { id: "citas", label: "Citas", icon: Calendar },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTabActiva(tab.id)}
                      className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${
                        tabActiva === tab.id
                          ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CONTENIDO DE TABS */}
          <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white border border-gray-200 shadow-xl">
            {/* TAB RESUMEN */}
            {tabActiva === "resumen" && (
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Activity className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                    Resumen Médico
                  </h2>
                </div>

               {/* INFORMACIÓN VITAL */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* PESO */}
  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
        <Weight className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          Peso
        </div>
        <div className="text-2xl font-black text-gray-900">
          {paciente.peso_kg && !isNaN(Number(paciente.peso_kg))
            ? `${Number(paciente.peso_kg).toFixed(1)} kg`
            : "N/A"}
        </div>
      </div>
    </div>
  </div>

  {/* ALTURA */}
  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
        <Ruler className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          Altura
        </div>
        <div className="text-2xl font-black text-gray-900">
          {paciente.altura_cm && !isNaN(Number(paciente.altura_cm))
            ? `${Number(paciente.altura_cm).toFixed(0)} cm`
            : "N/A"}
        </div>
      </div>
    </div>
  </div>

  {/* IMC */}
  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
        <Target className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          IMC
        </div>
        <div className="text-2xl font-black text-gray-900">
          {paciente.imc && !isNaN(Number(paciente.imc))
            ? Number(paciente.imc).toFixed(1)
            : "N/A"}
        </div>
        <div className={`text-xs font-bold ${imcInfo.color} mt-1`}>
          {imcInfo.texto}
        </div>
      </div>
    </div>
  </div>
</div>

                {/* ALERTAS CRÍTICAS */}
                {(alergias.filter((a) => a.severidad === "critica" && a.activa).length > 0 ||
                  condiciones.filter((c) => c.estado === "descompensada" && c.activa).length >
                    0) && (
                  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-red-50 border-2 border-red-500">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-black text-red-900 mb-2">
                          ⚠️ Alertas Críticas
                        </h3>
                        <ul className="space-y-2">
                          {alergias
                            .filter((a) => a.severidad === "critica" && a.activa)
                            .map((alergia) => (
                              <li
                                key={alergia.id_alergia}
                                className="text-sm md:text-base font-semibold text-red-800"
                              >
                                • Alergia crítica: {alergia.nombre_alergeno}
                              </li>
                            ))}
                          {condiciones
                            .filter((c) => c.estado === "descompensada" && c.activa)
                            .map((condicion) => (
                              <li
                                key={condicion.id_condicion}
                                className="text-sm md:text-base font-semibold text-red-800"
                              >
                                • Condición descompensada: {condicion.nombre_condicion}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* ÚLTIMOS SIGNOS VITALES */}
                {signosVitales.length > 0 && (
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <HeartPulse className="w-6 h-6 text-red-600" />
                      Últimos Signos Vitales
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                      {signosVitales[0].presion_sistolica && (
                        <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                          <div className="text-xs font-bold text-gray-600 mb-1">Presión Arterial</div>
                          <div className="text-xl md:text-2xl font-black text-gray-900">
                            {signosVitales[0].presion_sistolica}/{signosVitales[0].presion_diastolica}
                          </div>
                          <div className="text-xs text-gray-500">mmHg</div>
                        </div>
                      )}
                      {signosVitales[0].frecuencia_cardiaca && (
                        <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                          <div className="text-xs font-bold text-gray-600 mb-1">Frecuencia Cardíaca</div>
                          <div className="text-xl md:text-2xl font-black text-gray-900">
                            {signosVitales[0].frecuencia_cardiaca}
                          </div>
                          <div className="text-xs text-gray-500">bpm</div>
                        </div>
                      )}
                      {signosVitales[0].temperatura && (
                        <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                          <div className="text-xs font-bold text-gray-600 mb-1">Temperatura</div>
                          <div className="text-xl md:text-2xl font-black text-gray-900">
                            {signosVitales[0].temperatura}°
                          </div>
                          <div className="text-xs text-gray-500">Celsius</div>
                        </div>
                      )}
                      {signosVitales[0].saturacion_oxigeno && (
                        <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
                          <div className="text-xs font-bold text-gray-600 mb-1">Saturación O₂</div>
                          <div className="text-xl md:text-2xl font-black text-gray-900">
                            {signosVitales[0].saturacion_oxigeno}%
                          </div>
                          <div className="text-xs text-gray-500">SpO₂</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MEDICAMENTOS ACTIVOS */}
                {medicamentos.filter((m) => m.activo).length > 0 && (
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                      <Pill className="w-6 h-6 text-purple-600" />
                      Medicamentos Activos ({medicamentos.filter((m) => m.activo).length})
                    </h3>
                    <div className="space-y-3">
                      {medicamentos
                        .filter((m) => m.activo)
                        .slice(0, 5)
                        .map((med) => (
                          <div
                            key={med.id_medicamento}
                            className="rounded-xl p-4 bg-purple-50 border border-purple-200 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="text-base md:text-lg font-black text-gray-900 mb-1">
                                  {med.nombre_medicamento}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-semibold text-gray-600">
                                  {med.dosis && <span>Dosis: {med.dosis}</span>}
                                  {med.frecuencia && <span>• {med.frecuencia}</span>}
                                  {med.via_administracion && <span>• Vía: {med.via_administracion}</span>}
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 whitespace-nowrap">
                                Activo
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* PRÓXIMA CITA */}
                {citas.filter((c) => c.estado === "programada" || c.estado === "confirmada").length >
                  0 && (
                  <div className="rounded-xl md:rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2">
                          Próxima Cita Programada
                        </h3>
                        {citas
                          .filter((c) => c.estado === "programada" || c.estado === "confirmada")
                          .slice(0, 1)
                          .map((cita) => (
                            <div key={cita.id_cita}>
                              <p className="text-base md:text-lg font-bold text-indigo-900">
                                {formatearFechaHora(cita.fecha_hora)}
                              </p>
                              {cita.motivo && (
                                <p className="text-sm md:text-base font-semibold text-gray-700 mt-1">
                                  Motivo: {cita.motivo}
                                </p>
                              )}
                              {cita.medico_nombre && (
                                <p className="text-sm font-semibold text-gray-600 mt-1">
                                  Dr(a). {cita.medico_nombre}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB HISTORIA CLÍNICA */}
            {tabActiva === "historia" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <FileText className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                    Historia Clínica Completa
                  </h2>
                  <button className="px-4 md:px-6 py-2 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 flex items-center gap-2">
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    Exportar
                  </button>
                </div>
{/* DATOS PERSONALES COMPLETOS */}
<div className="rounded-xl md:rounded-2xl p-6 bg-gray-50 border border-gray-200">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-black text-gray-900">Datos Personales</h3>
    {modoEdicion && (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white animate-pulse flex items-center gap-2">
        <Edit className="w-3 h-3" />
        MODO EDICIÓN
      </span>
    )}
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* NOMBRE */}
    <div>
      <span className="text-sm font-bold text-gray-600">Nombre *:</span>
      {modoEdicion ? (
        <input
          type="text"
          value={pacienteEditado.nombre || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, nombre: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="Nombre del paciente"
          required
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.nombre}
        </p>
      )}
    </div>

    {/* APELLIDO PATERNO */}
    <div>
      <span className="text-sm font-bold text-gray-600">Apellido Paterno *:</span>
      {modoEdicion ? (
        <input
          type="text"
          value={pacienteEditado.apellido_paterno || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              apellido_paterno: e.target.value,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="Apellido paterno"
          required
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.apellido_paterno}
        </p>
      )}
    </div>

    {/* APELLIDO MATERNO */}
    <div>
      <span className="text-sm font-bold text-gray-600">Apellido Materno:</span>
      {modoEdicion ? (
        <input
          type="text"
          value={pacienteEditado.apellido_materno || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              apellido_materno: e.target.value,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="Apellido materno (opcional)"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.apellido_materno || "N/A"}
        </p>
      )}
    </div>

    {/* RUT */}
    <div>
      <span className="text-sm font-bold text-gray-600">RUT *:</span>
      {modoEdicion ? (
        <input
          type="text"
          value={pacienteEditado.rut || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, rut: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="12345678-9"
          required
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.rut}
        </p>
      )}
    </div>

    {/* FECHA DE NACIMIENTO */}
    <div>
      <span className="text-sm font-bold text-gray-600">Fecha de Nacimiento *:</span>
      {modoEdicion ? (
        <input
          type="date"
          value={pacienteEditado.fecha_nacimiento || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              fecha_nacimiento: e.target.value,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          required
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {formatearFecha(paciente.fecha_nacimiento)} ({paciente.edad} años)
        </p>
      )}
    </div>

    {/* GÉNERO */}
    <div>
      <span className="text-sm font-bold text-gray-600">Género *:</span>
      {modoEdicion ? (
        <select
          value={pacienteEditado.genero || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, genero: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          required
        >
          <option value="">Seleccionar género</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
          <option value="prefiero_no_decir">Prefiero no decir</option>
        </select>
      ) : (
        <p className="text-base font-semibold text-gray-900 capitalize mt-1">
          {paciente.genero}
        </p>
      )}
    </div>

    {/* ESTADO CIVIL */}
    <div>
      <span className="text-sm font-bold text-gray-600">Estado Civil:</span>
      {modoEdicion ? (
        <select
          value={pacienteEditado.estado_civil || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              estado_civil: e.target.value,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
        >
          <option value="">Seleccionar estado civil</option>
          <option value="soltero">Soltero/a</option>
          <option value="casado">Casado/a</option>
          <option value="divorciado">Divorciado/a</option>
          <option value="viudo">Viudo/a</option>
          <option value="conviviente">Conviviente</option>
          <option value="separado">Separado/a</option>
        </select>
      ) : (
        <p className="text-base font-semibold text-gray-900 capitalize mt-1">
          {paciente.estado_civil || "N/A"}
        </p>
      )}
    </div>

    {/* OCUPACIÓN */}
    <div>
      <span className="text-sm font-bold text-gray-600">Ocupación:</span>
      {modoEdicion ? (
        <input
          type="text"
          value={pacienteEditado.ocupacion || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, ocupacion: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="Profesión u ocupación"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.ocupacion || "N/A"}
        </p>
      )}
    </div>

    {/* PREVISIÓN */}
    <div>
      <span className="text-sm font-bold text-gray-600">Previsión:</span>
      {modoEdicion ? (
        <select
          value={pacienteEditado.prevision || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, prevision: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
        >
          <option value="">Seleccionar previsión</option>
          <option value="FONASA">FONASA</option>
          <option value="ISAPRE">ISAPRE</option>
          <option value="PARTICULAR">Particular</option>
          <option value="CAPREDENA">CAPREDENA</option>
          <option value="DIPRECA">DIPRECA</option>
          <option value="OTRA">Otra</option>
        </select>
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.prevision || "N/A"}
        </p>
      )}
    </div>

    {/* NÚMERO DE PREVISIÓN */}
    {(modoEdicion || paciente.numero_prevision) && (
      <div>
        <span className="text-sm font-bold text-gray-600">Número de Previsión:</span>
        {modoEdicion ? (
          <input
            type="text"
            value={pacienteEditado.numero_prevision || ""}
            onChange={(e) =>
              setPacienteEditado({
                ...pacienteEditado,
                numero_prevision: e.target.value,
              })
            }
            className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
            placeholder="Número de afiliación"
          />
        ) : (
          <p className="text-base font-semibold text-gray-900 mt-1">
            {paciente.numero_prevision || "N/A"}
          </p>
        )}
      </div>
    )}

    {/* GRUPO SANGUÍNEO */}
    <div>
      <span className="text-sm font-bold text-gray-600">Grupo Sanguíneo *:</span>
      {modoEdicion ? (
        <select
          value={pacienteEditado.grupo_sanguineo || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              grupo_sanguineo: e.target.value,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          required
        >
          <option value="">Seleccionar grupo sanguíneo</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="Desconocido">Desconocido</option>
        </select>
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.grupo_sanguineo}
        </p>
      )}
    </div>

    {/* PESO */}
    <div>
      <span className="text-sm font-bold text-gray-600">Peso (kg):</span>
      {modoEdicion ? (
        <input
          type="number"
          step="0.1"
          min="0"
          max="500"
          value={pacienteEditado.peso_kg || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              peso_kg: parseFloat(e.target.value) || null,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="Ej: 70.5"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.peso_kg ? `${paciente.peso_kg} kg` : "N/A"}
        </p>
      )}
    </div>

    {/* ALTURA */}
    <div>
      <span className="text-sm font-bold text-gray-600">Altura (cm):</span>
      {modoEdicion ? (
        <input
          type="number"
          step="0.1"
          min="0"
          max="300"
          value={pacienteEditado.altura_cm || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              altura_cm: parseFloat(e.target.value) || null,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="Ej: 170"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.altura_cm ? `${paciente.altura_cm} cm` : "N/A"}
        </p>
      )}
    </div>

    {/* IMC (CALCULADO AUTOMÁTICAMENTE) */}
    {(paciente.imc || (modoEdicion && pacienteEditado.peso_kg && pacienteEditado.altura_cm)) && (
      <div>
        <span className="text-sm font-bold text-gray-600">IMC:</span>
        <div className="mt-1">
          {modoEdicion && pacienteEditado.peso_kg && pacienteEditado.altura_cm ? (
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-indigo-600">
                {(
                  pacienteEditado.peso_kg /
                  Math.pow(pacienteEditado.altura_cm / 100, 2)
                ).toFixed(1)}
              </span>
              <span className="text-xs font-bold text-gray-500">(calculado automáticamente)</span>
            </div>
          ) : (
            <p className="text-base font-semibold text-gray-900">
              {paciente.imc ? paciente.imc.toFixed(1) : "N/A"}
            </p>
          )}
        </div>
      </div>
    )}
  </div>

  {/* ALERTA DE MODO EDICIÓN */}
  {modoEdicion && (
    <div className="mt-4 p-3 rounded-lg bg-yellow-50 border-2 border-yellow-300">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-yellow-900 mb-1">
            MODO EDICIÓN ACTIVO
          </p>
          <p className="text-xs font-semibold text-yellow-800">
            Los cambios se guardarán al hacer clic en el botón "Guardar" en la parte superior.
            Los campos marcados con * son obligatorios.
          </p>
        </div>
      </div>
    </div>
  )}
</div>

          {/* CONTACTO */}
<div className="rounded-xl md:rounded-2xl p-6 bg-gray-50 border border-gray-200">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-black text-gray-900">Información de Contacto</h3>
    {modoEdicion && (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white animate-pulse flex items-center gap-2">
        <Edit className="w-3 h-3" />
        MODO EDICIÓN
      </span>
    )}
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* TELÉFONO */}
    <div>
      <span className="text-sm font-bold text-gray-600">Teléfono:</span>
      {modoEdicion ? (
        <input
          type="tel"
          value={pacienteEditado.telefono || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, telefono: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="+56 2 1234 5678"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.telefono || "N/A"}
        </p>
      )}
    </div>

    {/* CELULAR */}
    <div>
      <span className="text-sm font-bold text-gray-600">Celular:</span>
      {modoEdicion ? (
        <input
          type="tel"
          value={pacienteEditado.celular || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, celular: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="+56 9 1234 5678"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.celular || "N/A"}
        </p>
      )}
    </div>

    {/* EMAIL */}
    <div>
      <span className="text-sm font-bold text-gray-600">Email:</span>
      {modoEdicion ? (
        <input
          type="email"
          value={pacienteEditado.email || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, email: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="correo@ejemplo.com"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.email || "N/A"}
        </p>
      )}
    </div>

    {/* DIRECCIÓN */}
    <div className="md:col-span-2">
      <span className="text-sm font-bold text-gray-600">Dirección:</span>
      {modoEdicion ? (
        <input
          type="text"
          value={pacienteEditado.direccion || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, direccion: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="Calle, número, depto/casa"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.direccion || "N/A"}
        </p>
      )}
    </div>

    {/* CIUDAD */}
    <div>
      <span className="text-sm font-bold text-gray-600">Ciudad:</span>
      {modoEdicion ? (
        <input
          type="text"
          value={pacienteEditado.ciudad || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, ciudad: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
          placeholder="Ciudad o comuna"
        />
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.ciudad || "N/A"}
        </p>
      )}
    </div>

    {/* REGIÓN */}
    <div>
      <span className="text-sm font-bold text-gray-600">Región:</span>
      {modoEdicion ? (
        <select
          value={pacienteEditado.region || ""}
          onChange={(e) =>
            setPacienteEditado({ ...pacienteEditado, region: e.target.value })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold transition-all"
        >
          <option value="">Seleccionar región</option>
          <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
          <option value="Región de Tarapacá">Región de Tarapacá</option>
          <option value="Región de Antofagasta">Región de Antofagasta</option>
          <option value="Región de Atacama">Región de Atacama</option>
          <option value="Región de Coquimbo">Región de Coquimbo</option>
          <option value="Región de Valparaíso">Región de Valparaíso</option>
          <option value="Región Metropolitana">Región Metropolitana</option>
          <option value="Región del Libertador General Bernardo O'Higgins">
            Región del Libertador General Bernardo O'Higgins
          </option>
          <option value="Región del Maule">Región del Maule</option>
          <option value="Región de Ñuble">Región de Ñuble</option>
          <option value="Región del Biobío">Región del Biobío</option>
          <option value="Región de La Araucanía">Región de La Araucanía</option>
          <option value="Región de Los Ríos">Región de Los Ríos</option>
          <option value="Región de Los Lagos">Región de Los Lagos</option>
          <option value="Región de Aysén">Región de Aysén</option>
          <option value="Región de Magallanes">Región de Magallanes</option>
        </select>
      ) : (
        <p className="text-base font-semibold text-gray-900 mt-1">
          {paciente.region || "N/A"}
        </p>
      )}
    </div>
  </div>
</div>

{/* CONTACTO DE EMERGENCIA */}
<div className="rounded-xl md:rounded-2xl p-6 bg-red-50 border-2 border-red-300">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-black text-red-900 flex items-center gap-2">
      <AlertCircle className="w-6 h-6" />
      Contacto de Emergencia
    </h3>
    {modoEdicion && (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white animate-pulse flex items-center gap-2">
        <Edit className="w-3 h-3" />
        MODO EDICIÓN
      </span>
    )}
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* NOMBRE */}
    <div>
      <span className="text-sm font-bold text-red-700">Nombre:</span>
      {modoEdicion ? (
        <input
          type="text"
          value={pacienteEditado.contacto_emergencia_nombre || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              contacto_emergencia_nombre: e.target.value,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-semibold transition-all"
          placeholder="Nombre completo"
        />
      ) : (
        <p className="text-base font-semibold text-red-900 mt-1">
          {paciente.contacto_emergencia_nombre || "N/A"}
        </p>
      )}
    </div>

    {/* TELÉFONO */}
    <div>
      <span className="text-sm font-bold text-red-700">Teléfono:</span>
      {modoEdicion ? (
        <input
          type="tel"
          value={pacienteEditado.contacto_emergencia_telefono || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              contacto_emergencia_telefono: e.target.value,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-semibold transition-all"
          placeholder="+56 9 1234 5678"
        />
      ) : (
        <p className="text-base font-semibold text-red-900 mt-1">
          {paciente.contacto_emergencia_telefono || "N/A"}
        </p>
      )}
    </div>

    {/* RELACIÓN */}
    <div>
      <span className="text-sm font-bold text-red-700">Relación:</span>
      {modoEdicion ? (
        <select
          value={pacienteEditado.contacto_emergencia_relacion || ""}
          onChange={(e) =>
            setPacienteEditado({
              ...pacienteEditado,
              contacto_emergencia_relacion: e.target.value,
            })
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-semibold transition-all"
        >
          <option value="">Seleccionar relación</option>
          <option value="padre">Padre</option>
          <option value="madre">Madre</option>
          <option value="hijo">Hijo/a</option>
          <option value="conyuge">Cónyuge</option>
          <option value="hermano">Hermano/a</option>
          <option value="abuelo">Abuelo/a</option>
          <option value="tio">Tío/a</option>
          <option value="primo">Primo/a</option>
          <option value="amigo">Amigo/a</option>
          <option value="otro">Otro</option>
        </select>
      ) : (
        <p className="text-base font-semibold text-red-900 capitalize mt-1">
          {paciente.contacto_emergencia_relacion || "N/A"}
        </p>
      )}
    </div>
  </div>
</div>


                {/* DIAGNÓSTICO PRINCIPAL */}
                {paciente.diagnostico_principal && (
                  <div className="rounded-xl md:rounded-2xl p-6 bg-blue-50 border border-blue-200">
                    <h3 className="text-xl font-black text-blue-900 mb-3 flex items-center gap-2">
                      <Stethoscope className="w-6 h-6" />
                      Diagnóstico Principal
                    </h3>
                    <p className="text-base font-semibold text-gray-900">
                      {paciente.diagnostico_principal}
                    </p>
                  </div>
                )}

                {/* NOTAS IMPORTANTES */}
                {paciente.notas_importantes && (
                  <div className="rounded-xl md:rounded-2xl p-6 bg-yellow-50 border border-yellow-300">
                    <h3 className="text-xl font-black text-yellow-900 mb-3 flex items-center gap-2">
                      <Info className="w-6 h-6" />
                      Notas Importantes
                    </h3>
                    <p className="text-base font-semibold text-gray-900 whitespace-pre-wrap">
                      {paciente.notas_importantes}
                    </p>
                  </div>
                )}

                {/* TIMELINE DE REGISTRO */}
                <div className="rounded-xl md:rounded-2xl p-6 bg-gray-50 border border-gray-200">
                  <h3 className="text-xl font-black text-gray-900 mb-4">Historial de Registro</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600">Fecha de Registro</p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatearFecha(paciente.fecha_registro)}
                        </p>
                      </div>
                    </div>
                    {paciente.ultima_consulta && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600">Última Consulta</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatearFecha(paciente.ultima_consulta)}
                          </p>
                        </div>
                      </div>
                    )}
                    {estadisticas?.dias_desde_ultima_consulta && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-600">Días desde última consulta</p>
                          <p className="text-base font-semibold text-gray-900">
                            {estadisticas.dias_desde_ultima_consulta} días
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB ALERGIAS */}
            {tabActiva === "alergias" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-red-600" />
                    Alergias ({alergias.length})
                  </h2>
                  <button
                    onClick={() => setModalNuevaAlergia(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Alergia
                  </button>
                </div>

                {alergias.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300">
                    <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                      Sin Alergias Registradas
                    </h3>
                    <p className="text-base font-semibold text-gray-600 mb-6">
                      No hay alergias registradas para este paciente
                    </p>
                    <button
                      onClick={() => setModalNuevaAlergia(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      Registrar Primera Alergia
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {alergias.map((alergia) => (
                      <div
                        key={alergia.id_alergia}
                        className={`rounded-xl md:rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-2xl ${
                          alergia.activa
                            ? "bg-white border-red-300"
                            : "bg-gray-50 border-gray-300 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2">
                              {alergia.nombre_alergeno}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerColorSeveridad(
                                  alergia.severidad
                                )}`}
                              >
                                {alergia.severidad.toUpperCase()}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                                {alergia.tipo_alergia}
                              </span>
                              {alergia.activa ? (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-600">
                                  ACTIVA
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-600">
                                  INACTIVA
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        {alergia.sintomas && (
                          <div className="mb-3">
                            <p className="text-sm font-bold text-gray-600 mb-1">Síntomas:</p>
                            <p className="text-sm font-semibold text-gray-900">{alergia.sintomas}</p>
                          </div>
                        )}

                        {alergia.fecha_diagnostico && (
                          <div className="mb-3">
                            <p className="text-sm font-bold text-gray-600 mb-1">
                              Fecha de Diagnóstico:
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatearFecha(alergia.fecha_diagnostico)}
                            </p>
                          </div>
                        )}

                        {alergia.notas && (
                          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                            <p className="text-xs font-bold text-yellow-800 mb-1">NOTAS:</p>
                            <p className="text-sm font-semibold text-gray-900">{alergia.notas}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONDICIONES CRÓNICAS */}
            {tabActiva === "condiciones" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Heart className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
                    Condiciones Crónicas ({condiciones.length})
                  </h2>
                  <button
                    onClick={() => setModalNuevaCondicion(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Condición
                  </button>
                </div>

                {condiciones.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300">
                    <Heart className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                      Sin Condiciones Registradas
                    </h3>
                    <p className="text-base font-semibold text-gray-600 mb-6">
                      No hay condiciones crónicas registradas para este paciente
                    </p>
                    <button
                      onClick={() => setModalNuevaCondicion(true)}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      Registrar Primera Condición
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {condiciones.map((condicion) => (
                      <div
                        key={condicion.id_condicion}
                        className={`rounded-xl md:rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-2xl ${
                          condicion.activa
                            ? "bg-white border-green-300"
                            : "bg-gray-50 border-gray-300 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2">
                              {condicion.nombre_condicion}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  condicion.estado === "controlada"
                                    ? "bg-green-500/20 text-green-600"
                                    : condicion.estado === "en_tratamiento"
                                    ? "bg-blue-500/20 text-blue-600"
                                    : condicion.estado === "descompensada"
                                    ? "bg-red-500/20 text-red-600"
                                    : "bg-purple-500/20 text-purple-600"
                                }`}
                              >
                                {condicion.estado.replace("_", " ").toUpperCase()}
                              </span>
                              {condicion.activa ? (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-600">
                                  ACTIVA
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-600">
                                  INACTIVA
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        {condicion.fecha_diagnostico && (
                          <div className="mb-3">
                            <p className="text-sm font-bold text-gray-600 mb-1">
                              Fecha de Diagnóstico:
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatearFecha(condicion.fecha_diagnostico)}
                            </p>
                          </div>
                        )}

                        {condicion.notas && (
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <p className="text-xs font-bold text-blue-800 mb-1">NOTAS:</p>
                            <p className="text-sm font-semibold text-gray-900">{condicion.notas}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB MEDICAMENTOS */}
            {tabActiva === "medicamentos" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Pill className="w-7 h-7 md:w-8 md:h-8 text-purple-600" />
                    Medicamentos ({medicamentos.length})
                  </h2>
                  <button
                    onClick={() => setModalNuevoMedicamento(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Nuevo Medicamento
                  </button>
                </div>

                {/* FILTROS */}
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <button className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold text-sm">
                    Todos ({medicamentos.length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Activos ({medicamentos.filter((m) => m.activo).length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Inactivos ({medicamentos.filter((m) => !m.activo).length})
                  </button>
                </div>

                {medicamentos.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300">
                    <Pill className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                      Sin Medicamentos Registrados
                    </h3>
                    <p className="text-base font-semibold text-gray-600 mb-6">
                      No hay medicamentos registrados para este paciente
                    </p>
                    <button
                      onClick={() => setModalNuevoMedicamento(true)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      Registrar Primer Medicamento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicamentos.map((medicamento) => (
                      <div
                        key={medicamento.id_medicamento}
                        className={`rounded-xl md:rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-2xl ${
                          medicamento.activo
                            ? "bg-white border-purple-300"
                            : "bg-gray-50 border-gray-300 opacity-60"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0 w-full lg:w-auto">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Pill className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-1 truncate">
                                  {medicamento.nombre_medicamento}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                  {medicamento.activo ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-600">
                                      ACTIVO
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-600">
                                      INACTIVO
                                    </span>
                                  )}
                                  {medicamento.via_administracion && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600">
                                      {medicamento.via_administracion}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-0 lg:ml-15">
                              {medicamento.dosis && (
                                <div>
                                  <p className="text-xs font-bold text-gray-600 mb-1">Dosis:</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {medicamento.dosis}
                                  </p>
                                </div>
                              )}
                              {medicamento.frecuencia && (
                                <div>
                                  <p className="text-xs font-bold text-gray-600 mb-1">Frecuencia:</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {medicamento.frecuencia}
                                  </p>
                                </div>
                              )}
                              {medicamento.fecha_inicio && (
                                <div>
                                  <p className="text-xs font-bold text-gray-600 mb-1">
                                    Fecha Inicio:
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatearFecha(medicamento.fecha_inicio)}
                                  </p>
                                </div>
                              )}
                              {medicamento.fecha_fin && (
                                <div>
                                  <p className="text-xs font-bold text-gray-600 mb-1">Fecha Fin:</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatearFecha(medicamento.fecha_fin)}
                                  </p>
                                </div>
                              )}
                              {medicamento.medico_prescriptor && (
                                <div className="sm:col-span-2">
                                  <p className="text-xs font-bold text-gray-600 mb-1">
                                    Prescrito por:
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    Dr(a). {medicamento.medico_prescriptor}
                                  </p>
                                </div>
                              )}
                            </div>

                            {medicamento.indicaciones && (
                              <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                                <p className="text-xs font-bold text-purple-800 mb-1">
                                  INDICACIONES:
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {medicamento.indicaciones}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex lg:flex-col items-center gap-2 w-full lg:w-auto">
                            <button className="flex-1 lg:flex-none px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                              <Edit className="w-4 h-4" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button className="flex-1 lg:flex-none px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm border border-gray-200 transition-all flex items-center justify-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">Ver</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONSULTAS */}
            {tabActiva === "consultas" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Stethoscope className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                    Historial de Consultas ({consultas.length})
                  </h2>
                  <button
                    onClick={() => setModalNuevaConsulta(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Consulta
                  </button>
                </div>

                {consultas.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300">
                    <Stethoscope className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                      Sin Consultas Registradas
                    </h3>
                    <p className="text-base font-semibold text-gray-600 mb-6">
                      No hay consultas registradas para este paciente
                    </p>
                    <button
                      onClick={() => setModalNuevaConsulta(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      Registrar Primera Consulta
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultas.map((consulta, index) => (
                      <div
                        key={consulta.id_consulta}
                        className="rounded-xl md:rounded-2xl p-6 bg-white border-2 border-blue-200 transition-all duration-300 hover:shadow-2xl"
                      >
                        <div className="flex items-start gap-4">
                          {/* TIMELINE INDICATOR */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                              <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            {index < consultas.length - 1 && (
                              <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                            )}
                          </div>

                          {/* CONTENIDO */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-1">
                                  Consulta #{consultas.length - index}
                                </h3>
                                <p className="text-sm font-semibold text-gray-600">
                                  {formatearFechaHora(consulta.fecha_consulta)}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                  consulta.estado === "completada"
                                    ? "bg-green-500/20 text-green-600"
                                    : consulta.estado === "pendiente"
                                    ? "bg-yellow-500/20 text-yellow-600"
                                    : "bg-red-500/20 text-red-600"
                                }`}
                              >
                                {consulta.estado.toUpperCase()}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {consulta.medico_nombre && (
                                <div>
                                  <p className="text-xs font-bold text-gray-600 mb-1">
                                    Médico Tratante:
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    Dr(a). {consulta.medico_nombre}
                                    {consulta.especialidad && ` - ${consulta.especialidad}`}
                                  </p>
                                </div>
                              )}

                              {consulta.motivo_consulta && (
                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                  <p className="text-xs font-bold text-blue-800 mb-1">
                                    MOTIVO DE CONSULTA:
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {consulta.motivo_consulta}
                                  </p>
                                </div>
                              )}

                              {consulta.diagnostico && (
                                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                                  <p className="text-xs font-bold text-purple-800 mb-1">
                                    DIAGNÓSTICO:
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {consulta.diagnostico}
                                  </p>
                                </div>
                              )}

                              {consulta.tratamiento && (
                                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                  <p className="text-xs font-bold text-green-800 mb-1">
                                    TRATAMIENTO:
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {consulta.tratamiento}
                                  </p>
                                </div>
                              )}

                              {consulta.observaciones && (
                                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                  <p className="text-xs font-bold text-yellow-800 mb-1">
                                    OBSERVACIONES:
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {consulta.observaciones}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                              <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Ver Detalle
                              </button>
                              <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm border border-gray-200 transition-all flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Descargar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB SIGNOS VITALES */}
            {tabActiva === "signos" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <HeartPulse className="w-7 h-7 md:w-8 md:h-8 text-red-600" />
                    Signos Vitales ({signosVitales.length})
                  </h2>
                  <button
                    onClick={() => setModalNuevoSignoVital(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Registrar Signos
                  </button>
                </div>

                {signosVitales.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300">
                    <HeartPulse className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                      Sin Signos Vitales Registrados
                    </h3>
                    <p className="text-base font-semibold text-gray-600 mb-6">
                      No hay signos vitales registrados para este paciente
                    </p>
                    <button
                      onClick={() => setModalNuevoSignoVital(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      Registrar Primeros Signos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* GRÁFICAS DE TENDENCIAS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="rounded-xl md:rounded-2xl p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                            <HeartPulse className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-900">Presión Arterial</h3>
                            <p className="text-sm font-semibold text-gray-600">
                              Últimos {signosVitales.length} registros
                            </p>
                          </div>
                        </div>
                        <div className="h-40 flex items-end justify-between gap-2">
                          {signosVitales.slice(0, 10).reverse().map((signo, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full bg-red-500 rounded-t-lg transition-all hover:bg-red-600"
                                style={{
                                  height: `${
                                    signo.presion_sistolica
                                      ? (signo.presion_sistolica / 200) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                              <span className="text-xs font-bold text-gray-600">
                                {signo.presion_sistolica || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl md:rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-900">Frecuencia Cardíaca</h3>
                            <p className="text-sm font-semibold text-gray-600">
                              Últimos {signosVitales.length} registros
                            </p>
                          </div>
                        </div>
                        <div className="h-40 flex items-end justify-between gap-2">
                          {signosVitales.slice(0, 10).reverse().map((signo, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                                style={{
                                  height: `${
                                    signo.frecuencia_cardiaca
                                      ? (signo.frecuencia_cardiaca / 200) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                              <span className="text-xs font-bold text-gray-600">
                                {signo.frecuencia_cardiaca || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* TABLA DE SIGNOS VITALES */}
                    <div className="rounded-xl md:rounded-2xl overflow-hidden border-2 border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                            <tr>
                              <th className="px-4 py-4 text-left text-xs md:text-sm font-black uppercase">
                                Fecha
                              </th>
                              <th className="px-4 py-4 text-center text-xs md:text-sm font-black uppercase">
                                PA
                              </th>
                              <th className="px-4 py-4 text-center text-xs md:text-sm font-black uppercase">
                                FC
                              </th>
                              <th className="px-4 py-4 text-center text-xs md:text-sm font-black uppercase">
                                Temp
                              </th>
                              <th className="px-4 py-4 text-center text-xs md:text-sm font-black uppercase">
                                SpO₂
                              </th>
                              <th className="px-4 py-4 text-center text-xs md:text-sm font-black uppercase">
                                Peso
                              </th>
                              <th className="px-4 py-4 text-center text-xs md:text-sm font-black uppercase">
                                IMC
                              </th>
                              <th className="px-4 py-4 text-center text-xs md:text-sm font-black uppercase">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {signosVitales.map((signo) => (
                              <tr
                                key={signo.id_signo}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                  {formatearFechaHora(signo.fecha_registro)}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                                  {signo.presion_sistolica && signo.presion_diastolica
                                    ? `${signo.presion_sistolica}/${signo.presion_diastolica}`
                                    : "-"}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                                  {signo.frecuencia_cardiaca || "-"}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                                  {signo.temperatura ? `${signo.temperatura}°` : "-"}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                                  {signo.saturacion_oxigeno ? `${signo.saturacion_oxigeno}%` : "-"}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                                  {signo.peso_kg ? `${signo.peso_kg} kg` : "-"}
                                </td>
                                <td className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                                  {signo.imc ? signo.imc.toFixed(1) : "-"}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                    <Eye className="w-4 h-4 text-gray-600" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB EXÁMENES */}
            {tabActiva === "examenes" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Microscope className="w-7 h-7 md:w-8 md:h-8 text-yellow-600" />
                    Exámenes Médicos ({examenes.length})
                  </h2>
                  <button
                    onClick={() => setModalNuevoExamen(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Solicitar Examen
                  </button>
                </div>

                {/* FILTROS POR ESTADO */}
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <button className="px-4 py-2 rounded-lg bg-yellow-600 text-white font-bold text-sm">
                    Todos ({examenes.length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Pendientes ({examenes.filter((e) => e.estado === "pendiente").length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Realizados ({examenes.filter((e) => e.estado === "realizado").length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Cancelados ({examenes.filter((e) => e.estado === "cancelado").length})
                  </button>
                </div>

                {examenes.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300">
                    <Microscope className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                      Sin Exámenes Registrados
                    </h3>
                    <p className="text-base font-semibold text-gray-600 mb-6">
                      No hay exámenes médicos registrados para este paciente
                    </p>
                    <button
                      onClick={() => setModalNuevoExamen(true)}
                      className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      Solicitar Primer Examen
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {examenes.map((examen) => (
                      <div
                        key={examen.id_examen}
                        className="rounded-xl md:rounded-2xl p-6 bg-white border-2 border-yellow-200 transition-all duration-300 hover:shadow-2xl"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Microscope className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-1 truncate">
                              {examen.nombre_examen}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                                {examen.tipo_examen}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  examen.estado === "realizado"
                                    ? "bg-green-500/20 text-green-600"
                                    : examen.estado === "pendiente"
                                    ? "bg-yellow-500/20 text-yellow-600"
                                    : "bg-red-500/20 text-red-600"
                                }`}
                              >
                                {examen.estado.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div>
                            <p className="text-xs font-bold text-gray-600">Fecha Solicitud:</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatearFecha(examen.fecha_solicitud)}
                            </p>
                          </div>
                          {examen.fecha_realizacion && (
                            <div>
                              <p className="text-xs font-bold text-gray-600">Fecha Realización:</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatearFecha(examen.fecha_realizacion)}
                              </p>
                            </div>
                          )}
                          {examen.medico_solicitante && (
                            <div>
                              <p className="text-xs font-bold text-gray-600">Solicitado por:</p>
                              <p className="text-sm font-semibold text-gray-900">
                                Dr(a). {examen.medico_solicitante}
                              </p>
                            </div>
                          )}
                        </div>

                        {examen.resultado && (
                          <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-4">
                            <p className="text-xs font-bold text-green-800 mb-1">RESULTADO:</p>
                            <p className="text-sm font-semibold text-gray-900">{examen.resultado}</p>
                          </div>
                        )}

                        {examen.observaciones && (
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                            <p className="text-xs font-bold text-blue-800 mb-1">OBSERVACIONES:</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {examen.observaciones}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {examen.archivo_url && (
                            <button className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                              <Download className="w-4 h-4" />
                              Descargar
                            </button>
                          )}
                          <button className="flex-1 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm border border-gray-200 transition-all flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB DOCUMENTOS */}
            {tabActiva === "documentos" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <FileCheck className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                    Documentos ({documentos.length})
                  </h2>
                  <button
                    onClick={() => setModalNuevoDocumento(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Subir Documento
                  </button>
                </div>

                {documentos.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300">
                    <FileCheck className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                      Sin Documentos
                    </h3>
                    <p className="text-base font-semibold text-gray-600 mb-6">
                      No hay documentos subidos para este paciente
                    </p>
                    <button
                      onClick={() => setModalNuevoDocumento(true)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      Subir Primer Documento
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {documentos.map((documento) => (
                      <div
                        key={documento.id_documento}
                        className="rounded-xl md:rounded-2xl p-6 bg-white border-2 border-indigo-200 transition-all duration-300 hover:shadow-2xl cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            {documento.extension === "pdf" ? (
                              <FileText className="w-6 h-6 text-white" />
                            ) : documento.extension.match(/jpg|jpeg|png|gif/) ? (
                              <ImageIcon className="w-6 h-6 text-white" />
                            ) : documento.extension.match(/doc|docx/) ? (
                              <FileText className="w-6 h-6 text-white" />
                            ) : (
                              <Paperclip className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-black text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                              {documento.nombre_documento}
                            </h3>
                            <p className="text-xs font-bold text-gray-600 uppercase">
                              {documento.tipo_documento}
                            </p>
                          </div>
                        </div>

                        {documento.descripcion && (
                          <p className="text-sm font-semibold text-gray-700 mb-3 line-clamp-2">
                            {documento.descripcion}
                          </p>
                        )}

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                            <span>Subido por:</span>
                            <span className="text-gray-900">{documento.subido_por}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                            <span>Fecha:</span>
                            <span className="text-gray-900">
                              {formatearFecha(documento.fecha_subida)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                            <span>Tamaño:</span>
                            <span className="text-gray-900">
                              {(documento.tamano_bytes / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Descargar
                          </button>
                          <button className="px-3 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs border border-gray-200 transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CITAS */}
            {tabActiva === "citas" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    <Calendar className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                    Agenda de Citas ({citas.length})
                  </h2>
                  <button
                    onClick={() => setModalNuevaCita(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Agendar Cita
                  </button>
                </div>

                {/* FILTROS POR ESTADO */}
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm">
                    Todas ({citas.length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Programadas ({citas.filter((c) => c.estado === "programada").length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Confirmadas ({citas.filter((c) => c.estado === "confirmada").length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Completadas ({citas.filter((c) => c.estado === "completada").length})
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-200">
                    Canceladas ({citas.filter((c) => c.estado === "cancelada").length})
                  </button>
                </div>

                {citas.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300">
                    <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                      Sin Citas Agendadas
                    </h3>
                    <p className="text-base font-semibold text-gray-600 mb-6">
                      No hay citas programadas para este paciente
                    </p>
                    <button
                      onClick={() => setModalNuevaCita(true)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      Agendar Primera Cita
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {citas.map((cita) => (
                      <div
                        key={cita.id_cita}
                        className={`rounded-xl md:rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-2xl ${
                          cita.estado === "programada" || cita.estado === "confirmada"
                            ? "bg-white border-indigo-300"
                            : cita.estado === "completada"
                            ? "bg-green-50 border-green-300"
                            : cita.estado === "cancelada"
                            ? "bg-red-50 border-red-300"
                            : "bg-gray-50 border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                          {/* FECHA Y HORA */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                              <span className="text-2xl font-black">
                                {new Date(cita.fecha_hora).getDate()}
                              </span>
                              <span className="text-xs font-bold uppercase">
                                {new Date(cita.fecha_hora).toLocaleDateString("es-CL", {
                                  month: "short",
                                })}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-600 mb-1">Hora</p>
                              <p className="text-xl font-black text-gray-900">
                                {new Date(cita.fecha_hora).toLocaleTimeString("es-CL", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>

                          {/* DETALLES DE LA CITA */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-1">
                                  {cita.tipo_cita || "Consulta Médica"}
                                </h3>
                                <p className="text-sm font-semibold text-gray-600">
                                  Dr(a). {cita.medico_nombre}
                                  {cita.especialidad && ` - ${cita.especialidad}`}
                                </p>
                              </div>
                              <span
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${
                                  cita.estado === "programada"
                                    ? "bg-blue-500/20 text-blue-600"
                                    : cita.estado === "confirmada"
                                    ? "bg-green-500/20 text-green-600"
                                    : cita.estado === "completada"
                                    ? "bg-green-600/20 text-green-700"
                                    : cita.estado === "cancelada"
                                    ? "bg-red-500/20 text-red-600"
                                    : "bg-gray-500/20 text-gray-600"
                                }`}
                              >
                                {cita.estado.toUpperCase().replace("_", " ")}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {cita.motivo && (
                                <div className="sm:col-span-2">
                                  <p className="text-xs font-bold text-gray-600 mb-1">Motivo:</p>
                                  <p className="text-sm font-semibold text-gray-900">{cita.motivo}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-bold text-gray-600 mb-1">Duración:</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {cita.duracion_minutos} minutos
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-600 mb-1">Estado:</p>
                                <p className="text-sm font-semibold text-gray-900 capitalize">
                                  {cita.estado.replace("_", " ")}
                                </p>
                              </div>
                            </div>

                            {cita.notas && (
                              <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                <p className="text-xs font-bold text-yellow-800 mb-1">NOTAS:</p>
                                <p className="text-sm font-semibold text-gray-900">{cita.notas}</p>
                              </div>
                            )}
                          </div>

                          {/* ACCIONES */}
                          <div className="flex lg:flex-col items-center gap-2 w-full lg:w-auto">
                            {(cita.estado === "programada" || cita.estado === "confirmada") && (
                              <>
                                <button className="flex-1 lg:flex-none px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="hidden sm:inline">Confirmar</span>
                                </button>
                                <button className="flex-1 lg:flex-none px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                                  <X className="w-4 h-4" />
                                  <span className="hidden sm:inline">Cancelar</span>
                                </button>
                              </>
                            )}
                            <button className="flex-1 lg:flex-none px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm border border-gray-200 transition-all flex items-center justify-center gap-2">
                              <Edit className="w-4 h-4" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

         {/* BOTÓN FLOTANTE - Visible cuando el panel está cerrado */}
{!panelLateralAbierto && (
  <button
    onClick={() => setPanelLateralAbierto(true)}
    className="fixed right-6 top-28 z-40 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
    title="Información Rápida"
  >
    <Info className="w-6 h-6" />
    {/* Badge de notificaciones */}
    {(alergias.filter((a) => a.severidad === "critica" && a.activa).length > 0 ||
      examenes.filter((e) => e.estado === "pendiente").length > 0) && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold flex items-center justify-center">
        {alergias.filter((a) => a.severidad === "critica" && a.activa).length +
          examenes.filter((e) => e.estado === "pendiente").length}
      </span>
    )}
  </button>
)}

{/* OVERLAY - Clic fuera para cerrar */}
{panelLateralAbierto && (
  <div
    className="fixed inset-0 bg-black/30 z-40"
    onClick={() => setPanelLateralAbierto(false)}
  />
)}

{/* PANEL LATERAL DE INFORMACIÓN RÁPIDA */}
{panelLateralAbierto && (
  <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto">
    {/* HEADER CON BOTÓN DE CERRAR */}
    <div className="sticky top-0 bg-indigo-600 text-white p-4 flex items-center justify-between z-10">
      <h3 className="text-lg font-black flex items-center gap-2">
        <Info className="w-5 h-5" />
        Información Rápida
      </h3>
      <button
        onClick={() => setPanelLateralAbierto(false)}
        className="w-8 h-8 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
        title="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* RESUMEN MÉDICO */}
    <div className="p-6 space-y-4">
      {/* ALERTAS CRÍTICAS */}
      {alergias.filter((a) => a.severidad === "critica" && a.activa).length > 0 && (
        <div className="rounded-xl p-4 bg-red-50 border-2 border-red-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-black text-red-900">ALERGIAS CRÍTICAS</h4>
          </div>
          <ul className="space-y-1">
            {alergias
              .filter((a) => a.severidad === "critica" && a.activa)
              .map((alergia) => (
                <li
                  key={alergia.id_alergia}
                  className="text-xs font-bold text-red-800"
                >
                  • {alergia.nombre_alergeno}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* MEDICAMENTOS ACTIVOS */}
      {medicamentos.filter((m) => m.activo).length > 0 && (
        <div className="rounded-xl p-4 bg-purple-50 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-5 h-5 text-purple-600" />
            <h4 className="text-sm font-black text-purple-900">
              MEDICAMENTOS ({medicamentos.filter((m) => m.activo).length})
            </h4>
          </div>
          <ul className="space-y-2">
            {medicamentos
              .filter((m) => m.activo)
              .slice(0, 3)
              .map((med) => (
                <li key={med.id_medicamento} className="text-xs">
                  <p className="font-bold text-gray-900">{med.nombre_medicamento}</p>
                  <p className="font-semibold text-gray-600">
                    {med.dosis} - {med.frecuencia}
                  </p>
                </li>
              ))}
          </ul>
          {medicamentos.filter((m) => m.activo).length > 3 && (
            <button
              onClick={() => {
                setTabActiva("medicamentos");
                setPanelLateralAbierto(false);
              }}
              className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              Ver todos →
            </button>
          )}
        </div>
      )}

      {/* CONDICIONES ACTIVAS */}
      {condiciones.filter((c) => c.activa).length > 0 && (
        <div className="rounded-xl p-4 bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-black text-green-900">
              CONDICIONES ({condiciones.filter((c) => c.activa).length})
            </h4>
          </div>
          <ul className="space-y-1">
            {condiciones
              .filter((c) => c.activa)
              .slice(0, 3)
              .map((condicion) => (
                <li
                  key={condicion.id_condicion}
                  className="text-xs font-bold text-gray-900"
                >
                  • {condicion.nombre_condicion}
                </li>
              ))}
          </ul>
          {condiciones.filter((c) => c.activa).length > 3 && (
            <button
              onClick={() => {
                setTabActiva("condiciones");
                setPanelLateralAbierto(false);
              }}
              className="mt-2 text-xs font-bold text-green-600 hover:text-green-700"
            >
              Ver todas →
            </button>
          )}
        </div>
      )}

      {/* PRÓXIMA CITA */}
      {citas.filter((c) => c.estado === "programada" || c.estado === "confirmada")
        .length > 0 && (
        <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-black text-indigo-900">PRÓXIMA CITA</h4>
          </div>
          {citas
            .filter((c) => c.estado === "programada" || c.estado === "confirmada")
            .slice(0, 1)
            .map((cita) => (
              <div key={cita.id_cita}>
                <p className="text-sm font-bold text-gray-900">
                  {formatearFechaHora(cita.fecha_hora)}
                </p>
                {cita.motivo && (
                  <p className="text-xs font-semibold text-gray-600 mt-1">
                    {cita.motivo}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}

      {/* EXÁMENES PENDIENTES */}
      {examenes.filter((e) => e.estado === "pendiente").length > 0 && (
        <div className="rounded-xl p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Microscope className="w-5 h-5 text-yellow-600" />
            <h4 className="text-sm font-black text-yellow-900">
              EXÁMENES PENDIENTES ({examenes.filter((e) => e.estado === "pendiente").length})
            </h4>
          </div>
          <ul className="space-y-1">
            {examenes
              .filter((e) => e.estado === "pendiente")
              .slice(0, 3)
              .map((examen) => (
                <li key={examen.id_examen} className="text-xs font-bold text-gray-900">
                  • {examen.nombre_examen}
                </li>
              ))}
          </ul>
          {examenes.filter((e) => e.estado === "pendiente").length > 3 && (
            <button
              onClick={() => {
                setTabActiva("examenes");
                setPanelLateralAbierto(false);
              }}
              className="mt-2 text-xs font-bold text-yellow-600 hover:text-yellow-700"
            >
              Ver todos →
            </button>
          )}
        </div>
      )}

      {/* ACCIONES RÁPIDAS */}
      <div className="rounded-xl p-4 bg-gray-50 border border-gray-200">
        <h4 className="text-sm font-black text-gray-900 mb-3">ACCIONES RÁPIDAS</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              setModalNuevaConsulta(true);
              setPanelLateralAbierto(false);
            }}
            className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Consulta
          </button>
          <button
            onClick={() => {
              setModalNuevaCita(true);
              setPanelLateralAbierto(false);
            }}
            className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Agendar Cita
          </button>
          <button
            onClick={() => {
              setModalNuevoExamen(true);
              setPanelLateralAbierto(false);
            }}
            className="w-full px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Microscope className="w-4 h-4" />
            Solicitar Examen
          </button>
          <button
            onClick={() => {
              setModalNuevoSignoVital(true);
              setPanelLateralAbierto(false);
            }}
            className="w-full px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <HeartPulse className="w-4 h-4" />
            Registrar Signos
          </button>
        </div>
      </div>

      {/* CONTACTO DE EMERGENCIA */}
      {paciente.contacto_emergencia_nombre && (
        <div className="rounded-xl p-4 bg-red-50 border-2 border-red-300">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-black text-red-900">EMERGENCIA</h4>
          </div>
          <p className="text-xs font-bold text-gray-900">
            {paciente.contacto_emergencia_nombre}
          </p>
          {paciente.contacto_emergencia_telefono && (
            <p className="text-xs font-semibold text-gray-600">
              {paciente.contacto_emergencia_telefono}
            </p>
          )}
          {paciente.contacto_emergencia_relacion && (
            <p className="text-xs font-semibold text-gray-600 capitalize">
              {paciente.contacto_emergencia_relacion}
            </p>
          )}
        </div>
      )}
    </div>
  </div>
)}

        </div>
      </main>

      {/* MODALES */}
      {/* Modal Nueva Alergia */}
      {modalNuevaAlergia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                <AlertCircle className="w-7 h-7 text-red-600" />
                Nueva Alergia
              </h3>
              <button
                onClick={() => setModalNuevaAlergia(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre del Alérgeno *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold"
                  placeholder="Ej: Penicilina, Polen, Mariscos..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tipo de Alergia *
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold">
                    <option value="">Seleccionar tipo</option>
                    <option value="medicamento">Medicamento</option>
                    <option value="alimento">Alimento</option>
                    <option value="ambiental">Ambiental</option>
                    <option value="contacto">Contacto</option>
                    <option value="insectos">Insectos</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Severidad *
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold">
                    <option value="">Seleccionar severidad</option>
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="severa">Severa</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Síntomas</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold resize-none"
                  rows={3}
                  placeholder="Describe los síntomas que presenta..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Fecha de Diagnóstico
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold resize-none"
                  rows={3}
                  placeholder="Notas importantes sobre la alergia..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <input type="checkbox" id="alergia-activa" className="w-5 h-5" defaultChecked />
                <label htmlFor="alergia-activa" className="text-sm font-bold text-gray-900">
                  Alergia activa (marcar si el paciente actualmente presenta esta alergia)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Guardar Alergia
                </button>
                <button
                  type="button"
                  onClick={() => setModalNuevaAlergia(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Condición */}
      {modalNuevaCondicion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                <Heart className="w-7 h-7 text-green-600" />
                Nueva Condición Crónica
              </h3>
              <button
                onClick={() => setModalNuevaCondicion(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre de la Condición *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-semibold"
                  placeholder="Ej: Diabetes Tipo 2, Hipertensión Arterial..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Estado Actual *
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-semibold">
                    <option value="">Seleccionar estado</option>
                    <option value="controlada">Controlada</option>
                    <option value="en_tratamiento">En Tratamiento</option>
                    <option value="descompensada">Descompensada</option>
                    <option value="remision">En Remisión</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fecha de Diagnóstico
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notas y Observaciones
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-semibold resize-none"
                  rows={4}
                  placeholder="Detalles sobre la condición, tratamiento actual, evolución..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <input type="checkbox" id="condicion-activa" className="w-5 h-5" defaultChecked />
                <label htmlFor="condicion-activa" className="text-sm font-bold text-gray-900">
                  Condición activa (marcar si requiere seguimiento continuo)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Guardar Condición
                </button>
                <button
                  type="button"
                  onClick={() => setModalNuevaCondicion(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Medicamento */}
      {modalNuevoMedicamento && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                <Pill className="w-7 h-7 text-purple-600" />
                Nuevo Medicamento
              </h3>
              <button
                onClick={() => setModalNuevoMedicamento(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre del Medicamento *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold"
                  placeholder="Ej: Losartán, Metformina, Omeprazol..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dosis *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold"
                    placeholder="Ej: 50mg, 500mg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Frecuencia *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold"
                    placeholder="Ej: Cada 8 horas"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Vía de Administración
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold">
                    <option value="">Seleccionar</option>
                    <option value="oral">Oral</option>
                    <option value="intravenosa">Intravenosa</option>
                    <option value="intramuscular">Intramuscular</option>
                    <option value="subcutanea">Subcutánea</option>
                    <option value="topica">Tópica</option>
                    <option value="inhalatoria">Inhalatoria</option>
                    <option value="otra">Otra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fecha de Fin (opcional)
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Indicaciones y Observaciones
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold resize-none"
                  rows={3}
                  placeholder="Instrucciones especiales, precauciones, interacciones..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Médico Prescriptor
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold"
                  placeholder="Nombre del médico que prescribe"
                  defaultValue={
                    usuario?.medico
                      ? `${usuario.nombre} ${usuario.apellido_paterno}`
                      : ""
                  }
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
                <input type="checkbox" id="medicamento-activo" className="w-5 h-5" defaultChecked />
                <label htmlFor="medicamento-activo" className="text-sm font-bold text-gray-900">
                  Medicamento activo (el paciente está tomando actualmente este medicamento)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Guardar Medicamento
                </button>
                <button
                  type="button"
                  onClick={() => setModalNuevoMedicamento(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      

      

      {/* NOTA: Los demás modales (Nueva Consulta, Nuevo Signo Vital, Nuevo Examen, Nuevo Documento, Nueva Cita) 
          seguirían el mismo patrón de diseño premium y profesional */}

          {/* ========================================
    MODAL NUEVA CONSULTA
    ======================================== */}
{modalNuevaConsulta && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
          <Stethoscope className="w-7 h-7 text-blue-600" />
          Nueva Consulta Médica
        </h3>
        <button
          onClick={() => setModalNuevaConsulta(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* INFORMACIÓN DEL PACIENTE */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl">
            {paciente?.nombre[0]}{paciente?.apellido_paterno[0]}
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900">
              {paciente?.nombre_completo}
            </h4>
            <p className="text-sm font-semibold text-gray-600">
              RUT: {paciente?.rut} • {paciente?.edad} años • {paciente?.genero}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGuardarConsulta();
        }}
        className="space-y-6"
      >
        {/* FECHA Y HORA + TIPO DE CONSULTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fecha y Hora de la Consulta *
            </label>
            <input
              type="datetime-local"
              value={nuevaConsulta.fecha_hora}
              onChange={(e) =>
                setNuevaConsulta({ ...nuevaConsulta, fecha_hora: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tipo de Consulta *
            </label>
            <select
              value={nuevaConsulta.tipo_consulta}
              onChange={(e) =>
                setNuevaConsulta({ ...nuevaConsulta, tipo_consulta: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="primera_vez">Primera Vez</option>
              <option value="control">Control</option>
              <option value="urgencia">Urgencia</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="telemedicina">Telemedicina</option>
              <option value="domiciliaria">Domiciliaria</option>
              <option value="procedimiento">Procedimiento</option>
            </select>
          </div>
        </div>

        {/* MOTIVO DE CONSULTA */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Motivo de Consulta *
          </label>
          <textarea
            value={nuevaConsulta.motivo_consulta}
            onChange={(e) =>
              setNuevaConsulta({ ...nuevaConsulta, motivo_consulta: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="¿Por qué acude el paciente a consulta?"
            required
          ></textarea>
        </div>

        {/* SÍNTOMAS */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Síntomas y Signos Clínicos
          </label>
          <textarea
            value={nuevaConsulta.sintomas}
            onChange={(e) =>
              setNuevaConsulta({ ...nuevaConsulta, sintomas: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold resize-none"
            rows={4}
            placeholder="Describe los síntomas que presenta el paciente, duración, intensidad, factores que los agravan o alivian..."
          ></textarea>
        </div>

        {/* EXAMEN FÍSICO */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Examen Físico
          </label>
          <textarea
            value={nuevaConsulta.examen_fisico}
            onChange={(e) =>
              setNuevaConsulta({ ...nuevaConsulta, examen_fisico: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold resize-none"
            rows={4}
            placeholder="Hallazgos del examen físico: inspección, palpación, auscultación, percusión..."
          ></textarea>
        </div>

        {/* DIAGNÓSTICO */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Diagnóstico *
          </label>
          <textarea
            value={nuevaConsulta.diagnostico}
            onChange={(e) =>
              setNuevaConsulta({ ...nuevaConsulta, diagnostico: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Diagnóstico clínico, CIE-10 si aplica..."
            required
          ></textarea>
          <p className="mt-2 text-xs font-semibold text-gray-500">
            💡 Tip: Incluye diagnóstico principal y diagnósticos secundarios si los hay
          </p>
        </div>

        {/* TRATAMIENTO */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Plan de Tratamiento
          </label>
          <textarea
            value={nuevaConsulta.tratamiento}
            onChange={(e) =>
              setNuevaConsulta({ ...nuevaConsulta, tratamiento: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold resize-none"
            rows={5}
            placeholder="Medicamentos prescritos, dosis, frecuencia, duración, indicaciones no farmacológicas, exámenes solicitados, derivaciones..."
          ></textarea>
        </div>

        {/* OBSERVACIONES */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Observaciones y Notas Adicionales
          </label>
          <textarea
            value={nuevaConsulta.observaciones}
            onChange={(e) =>
              setNuevaConsulta({ ...nuevaConsulta, observaciones: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Información adicional relevante, evolución esperada, fecha de próximo control..."
          ></textarea>
        </div>

        {/* ALERTAS Y RECORDATORIOS */}
        <div className="space-y-3 p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
          <h4 className="text-sm font-black text-yellow-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recordatorios Importantes
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-2 border-yellow-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Solicitar exámenes de laboratorio
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-2 border-yellow-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Agendar próximo control
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-2 border-yellow-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Enviar receta médica al paciente
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-2 border-yellow-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Derivar a especialista
              </span>
            </label>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t-2 border-gray-200">
          <button
            type="submit"
            disabled={guardando}
            className="w-full sm:flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Consulta
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setModalNuevaConsulta(false)}
            disabled={guardando}
            className="w-full sm:w-auto px-6 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-xl font-bold text-base transition-all"
          >
            Cancelar
          </button>
        </div>

        {/* NOTA LEGAL */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 text-center">
            📋 Esta consulta quedará registrada en el historial médico del paciente y será
            parte de su ficha clínica oficial. Asegúrate de que toda la información sea
            precisa y completa.
          </p>
        </div>
      </form>
    </div>
  </div>
)}

{/* ========================================
    MODAL NUEVO SIGNO VITAL
    ======================================== */}
{modalNuevoSignoVital && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
          <HeartPulse className="w-7 h-7 text-red-600" />
          Registrar Signos Vitales
        </h3>
        <button
          onClick={() => setModalNuevoSignoVital(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* INFORMACIÓN DEL PACIENTE */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-black text-xl">
            {paciente?.nombre[0]}{paciente?.apellido_paterno[0]}
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900">
              {paciente?.nombre_completo}
            </h4>
            <p className="text-sm font-semibold text-gray-600">
              RUT: {paciente?.rut} • {paciente?.edad} años • {paciente?.genero}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGuardarSignoVital();
        }}
        className="space-y-6"
      >
        {/* FECHA Y HORA */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Fecha y Hora del Registro *
          </label>
          <input
            type="datetime-local"
            value={nuevoSignoVital.fecha_hora}
            onChange={(e) =>
              setNuevoSignoVital({ ...nuevoSignoVital, fecha_hora: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold"
            required
          />
        </div>

        {/* PRESIÓN ARTERIAL */}
        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="w-5 h-5 text-red-600" />
            <h4 className="text-base font-black text-red-900">Presión Arterial</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Presión Sistólica (mmHg)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="300"
                value={nuevoSignoVital.presion_sistolica}
                onChange={(e) =>
                  setNuevoSignoVital({
                    ...nuevoSignoVital,
                    presion_sistolica: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold"
                placeholder="Ej: 120"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Presión Diastólica (mmHg)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="200"
                value={nuevoSignoVital.presion_diastolica}
                onChange={(e) =>
                  setNuevoSignoVital({
                    ...nuevoSignoVital,
                    presion_diastolica: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold"
                placeholder="Ej: 80"
              />
            </div>
          </div>
        </div>

        {/* FRECUENCIAS */}
        <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h4 className="text-base font-black text-blue-900">Frecuencias</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Frecuencia Cardíaca (bpm)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="300"
                value={nuevoSignoVital.frecuencia_cardiaca}
                onChange={(e) =>
                  setNuevoSignoVital({
                    ...nuevoSignoVital,
                    frecuencia_cardiaca: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold"
                placeholder="Ej: 72"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Frecuencia Respiratoria (rpm)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={nuevoSignoVital.frecuencia_respiratoria}
                onChange={(e) =>
                  setNuevoSignoVital({
                    ...nuevoSignoVital,
                    frecuencia_respiratoria: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold"
                placeholder="Ej: 16"
              />
            </div>
          </div>
        </div>

        {/* TEMPERATURA Y SATURACIÓN */}
        <div className="p-4 rounded-xl bg-orange-50 border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-4">
            <Thermometer className="w-5 h-5 text-orange-600" />
            <h4 className="text-base font-black text-orange-900">
              Temperatura y Saturación
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="45"
                value={nuevoSignoVital.temperatura}
                onChange={(e) =>
                  setNuevoSignoVital({
                    ...nuevoSignoVital,
                    temperatura: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-semibold"
                placeholder="Ej: 36.5"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Saturación de Oxígeno (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={nuevoSignoVital.saturacion_oxigeno}
                onChange={(e) =>
                  setNuevoSignoVital({
                    ...nuevoSignoVital,
                    saturacion_oxigeno: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-semibold"
                placeholder="Ej: 98"
              />
            </div>
          </div>
        </div>

        {/* ANTROPOMETRÍA */}
        <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Weight className="w-5 h-5 text-green-600" />
            <h4 className="text-base font-black text-green-900">
              Medidas Antropométricas
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="500"
                value={nuevoSignoVital.peso}
                onChange={(e) =>
                  setNuevoSignoVital({
                    ...nuevoSignoVital,
                    peso: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-semibold"
                placeholder="Ej: 70.5"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Altura (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="300"
                value={nuevoSignoVital.altura}
                onChange={(e) =>
                  setNuevoSignoVital({
                    ...nuevoSignoVital,
                    altura: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-semibold"
                placeholder="Ej: 170"
              />
            </div>
          </div>

          {/* CÁLCULO AUTOMÁTICO DE IMC */}
          {nuevoSignoVital.peso && nuevoSignoVital.altura && (
            <div className="mt-4 p-3 rounded-lg bg-green-100 border border-green-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-green-900">
                  IMC Calculado:
                </span>
                <span className="text-lg font-black text-green-900">
                  {(
                    parseFloat(nuevoSignoVital.peso) /
                    Math.pow(parseFloat(nuevoSignoVital.altura) / 100, 2)
                  ).toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* GLUCOSA (OPCIONAL) */}
        <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Droplet className="w-5 h-5 text-purple-600" />
            <h4 className="text-base font-black text-purple-900">
              Glucosa (Opcional)
            </h4>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Glucosa (mg/dL)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="1000"
              value={nuevoSignoVital.glucosa}
              onChange={(e) =>
                setNuevoSignoVital({
                  ...nuevoSignoVital,
                  glucosa: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold"
              placeholder="Ej: 95"
            />
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Observaciones y Notas Adicionales
          </label>
          <textarea
            value={nuevoSignoVital.observaciones}
            onChange={(e) =>
              setNuevoSignoVital({
                ...nuevoSignoVital,
                observaciones: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Condiciones especiales durante la medición, estado del paciente, etc..."
          ></textarea>
        </div>

        {/* ALERTAS */}
        <div className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-black text-yellow-900 mb-2">
                Importante
              </h4>
              <ul className="text-xs font-semibold text-gray-700 space-y-1">
                <li>• Asegúrate de que las mediciones sean precisas</li>
                <li>• Verifica que el equipo esté calibrado correctamente</li>
                <li>• Registra cualquier anomalía en las observaciones</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t-2 border-gray-200">
          <button
            type="submit"
            disabled={guardando}
            className="w-full sm:flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Signos Vitales
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setModalNuevoSignoVital(false)}
            disabled={guardando}
            className="w-full sm:w-auto px-6 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-xl font-bold text-base transition-all"
          >
            Cancelar
          </button>
        </div>

        {/* NOTA LEGAL */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 text-center">
            📊 Los signos vitales quedarán registrados en el historial médico del
            paciente. Estos datos son fundamentales para el seguimiento clínico.
          </p>
        </div>
      </form>
    </div>
  </div>
)}

{/* ========================================
    MODAL NUEVO EXAMEN
    ======================================== */}
{modalNuevoExamen && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
          <Microscope className="w-7 h-7 text-yellow-600" />
          Solicitar Examen Médico
        </h3>
        <button
          onClick={() => setModalNuevoExamen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* INFORMACIÓN DEL PACIENTE */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-black text-xl">
            {paciente?.nombre[0]}{paciente?.apellido_paterno[0]}
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900">
              {paciente?.nombre_completo}
            </h4>
            <p className="text-sm font-semibold text-gray-600">
              RUT: {paciente?.rut} • {paciente?.edad} años • {paciente?.genero}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGuardarExamen();
        }}
        className="space-y-6"
      >
        {/* TIPO Y NOMBRE DEL EXAMEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tipo de Examen *
            </label>
            <select
              value={nuevoExamen.tipo_examen}
              onChange={(e) =>
                setNuevoExamen({ ...nuevoExamen, tipo_examen: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="imagenologia">Imagenología</option>
              <option value="cardiologia">Cardiología</option>
              <option value="neurologia">Neurología</option>
              <option value="endoscopia">Endoscopia</option>
              <option value="biopsia">Biopsia</option>
              <option value="microbiologia">Microbiología</option>
              <option value="patologia">Patología</option>
              <option value="genetica">Genética</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nombre del Examen *
            </label>
            <input
              type="text"
              value={nuevoExamen.nombre_examen}
              onChange={(e) =>
                setNuevoExamen({ ...nuevoExamen, nombre_examen: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold"
              placeholder="Ej: Hemograma completo, Radiografía de tórax..."
              required
            />
          </div>
        </div>

        {/* EXÁMENES COMUNES POR TIPO */}
        {nuevoExamen.tipo_examen && (
          <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-black text-blue-900">
                Exámenes Comunes de {nuevoExamen.tipo_examen}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {nuevoExamen.tipo_examen === "laboratorio" && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Hemograma completo" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Hemograma completo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Perfil bioquímico" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Perfil bioquímico
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Perfil lipídico" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Perfil lipídico
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Glucosa en ayunas" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Glucosa en ayunas
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Hemoglobina glicosilada" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Hemoglobina glicosilada
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Perfil tiroideo" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Perfil tiroideo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Orina completa" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Orina completa
                  </button>
                </>
              )}
              {nuevoExamen.tipo_examen === "imagenologia" && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Radiografía de tórax" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Radiografía de tórax
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Ecografía abdominal" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Ecografía abdominal
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Tomografía computarizada" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Tomografía computarizada
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Resonancia magnética" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Resonancia magnética
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Mamografía" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Mamografía
                  </button>
                </>
              )}
              {nuevoExamen.tipo_examen === "cardiologia" && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Electrocardiograma" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Electrocardiograma
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Ecocardiograma" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Ecocardiograma
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Holter 24 horas" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Holter 24 horas
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevoExamen({ ...nuevoExamen, nombre_examen: "Prueba de esfuerzo" })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-xs font-bold text-gray-700 border border-blue-300 transition-all"
                  >
                    Prueba de esfuerzo
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* FECHAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fecha de Solicitud *
            </label>
            <input
              type="date"
              value={nuevoExamen.fecha_solicitud}
              onChange={(e) =>
                setNuevoExamen({ ...nuevoExamen, fecha_solicitud: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fecha de Realización (Opcional)
            </label>
            <input
              type="date"
              value={nuevoExamen.fecha_realizacion}
              onChange={(e) =>
                setNuevoExamen({ ...nuevoExamen, fecha_realizacion: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold"
            />
          </div>
        </div>

        {/* PRIORIDAD Y ESTADO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Prioridad *
            </label>
            <select
              value={nuevoExamen.prioridad}
              onChange={(e) =>
                setNuevoExamen({ ...nuevoExamen, prioridad: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold"
              required
            >
              <option value="">Seleccionar prioridad</option>
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
              <option value="muy_urgente">Muy Urgente</option>
              <option value="emergencia">Emergencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Estado *
            </label>
            <select
              value={nuevoExamen.estado}
              onChange={(e) =>
                setNuevoExamen({ ...nuevoExamen, estado: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold"
              required
            >
              <option value="pendiente">Pendiente</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* INDICACIONES CLÍNICAS */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Indicaciones Clínicas / Motivo de Solicitud *
          </label>
          <textarea
            value={nuevoExamen.indicaciones}
            onChange={(e) =>
              setNuevoExamen({ ...nuevoExamen, indicaciones: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Describe el motivo clínico de la solicitud, síntomas relevantes, sospecha diagnóstica..."
            required
          ></textarea>
        </div>

        {/* RESULTADO (SI YA FUE REALIZADO) */}
        {nuevoExamen.estado === "realizado" && (
          <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h4 className="text-base font-black text-green-900">Resultado del Examen</h4>
            </div>
            <textarea
              value={nuevoExamen.resultado}
              onChange={(e) =>
                setNuevoExamen({ ...nuevoExamen, resultado: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-semibold resize-none"
              rows={4}
              placeholder="Ingresa los resultados del examen, hallazgos, valores obtenidos..."
            ></textarea>
          </div>
        )}

        {/* OBSERVACIONES */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Observaciones Adicionales
          </label>
          <textarea
            value={nuevoExamen.observaciones}
            onChange={(e) =>
              setNuevoExamen({ ...nuevoExamen, observaciones: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Instrucciones especiales, preparación requerida, alergias a contrastes, etc..."
          ></textarea>
        </div>

        {/* LUGAR DE REALIZACIÓN */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Lugar de Realización (Opcional)
          </label>
          <input
            type="text"
            value={nuevoExamen.lugar_realizacion}
            onChange={(e) =>
              setNuevoExamen({ ...nuevoExamen, lugar_realizacion: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold"
            placeholder="Ej: Laboratorio Clínico Central, Centro de Imagenología..."
          />
        </div>

        {/* MÉDICO SOLICITANTE */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Médico Solicitante
          </label>
          <input
            type="text"
            value={nuevoExamen.medico_solicitante}
            onChange={(e) =>
              setNuevoExamen({ ...nuevoExamen, medico_solicitante: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all font-semibold"
            placeholder="Nombre del médico solicitante"
            defaultValue={
              usuario?.medico
                ? `${usuario.nombre} ${usuario.apellido_paterno}`
                : ""
            }
          />
        </div>

        {/* PREPARACIÓN REQUERIDA */}
        <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            <h4 className="text-base font-black text-purple-900">
              Preparación del Paciente
            </h4>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoExamen.requiere_ayuno}
                onChange={(e) =>
                  setNuevoExamen({ ...nuevoExamen, requiere_ayuno: e.target.checked })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Requiere ayuno (8-12 horas)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoExamen.suspender_medicamentos}
                onChange={(e) =>
                  setNuevoExamen({
                    ...nuevoExamen,
                    suspender_medicamentos: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Suspender medicamentos específicos
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoExamen.hidratacion_previa}
                onChange={(e) =>
                  setNuevoExamen({
                    ...nuevoExamen,
                    hidratacion_previa: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Hidratación previa abundante
              </span>
            </label>
          </div>
        </div>

        {/* ALERTAS */}
        <div className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-black text-yellow-900 mb-2">
                Recordatorios Importantes
              </h4>
              <ul className="text-xs font-semibold text-gray-700 space-y-1">
                <li>• Verifica que el paciente no tenga contraindicaciones</li>
                <li>• Informa al paciente sobre la preparación necesaria</li>
                <li>• Especifica claramente las indicaciones clínicas</li>
                <li>• Coordina con el laboratorio/centro de imagenología</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t-2 border-gray-200">
          <button
            type="submit"
            disabled={guardando}
            className="w-full sm:flex-1 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Examen
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setModalNuevoExamen(false)}
            disabled={guardando}
            className="w-full sm:w-auto px-6 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-xl font-bold text-base transition-all"
          >
            Cancelar
          </button>
        </div>

        {/* NOTA LEGAL */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 text-center">
            🔬 La solicitud de examen quedará registrada en el historial del paciente.
            Asegúrate de proporcionar toda la información clínica relevante.
          </p>
        </div>
      </form>
    </div>
  </div>
)}

{/* ========================================
    MODAL NUEVO DOCUMENTO
    ======================================== */}
{modalNuevoDocumento && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
          <FileCheck className="w-7 h-7 text-indigo-600" />
          Subir Documento Médico
        </h3>
        <button
          onClick={() => setModalNuevoDocumento(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* INFORMACIÓN DEL PACIENTE */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl">
            {paciente?.nombre[0]}{paciente?.apellido_paterno[0]}
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900">
              {paciente?.nombre_completo}
            </h4>
            <p className="text-sm font-semibold text-gray-600">
              RUT: {paciente?.rut} • {paciente?.edad} años • {paciente?.genero}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGuardarDocumento();
        }}
        className="space-y-6"
      >
        {/* TIPO DE DOCUMENTO */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Tipo de Documento *
          </label>
          <select
            value={nuevoDocumento.tipo_documento}
            onChange={(e) =>
              setNuevoDocumento({ ...nuevoDocumento, tipo_documento: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
            required
          >
            <option value="">Seleccionar tipo</option>
            <option value="historia_clinica">Historia Clínica</option>
            <option value="informe_medico">Informe Médico</option>
            <option value="resultado_examen">Resultado de Examen</option>
            <option value="imagen_diagnostica">Imagen Diagnóstica</option>
            <option value="receta_medica">Receta Médica</option>
            <option value="orden_medica">Orden Médica</option>
            <option value="certificado_medico">Certificado Médico</option>
            <option value="epicrisis">Epicrisis</option>
            <option value="consentimiento_informado">Consentimiento Informado</option>
            <option value="interconsulta">Interconsulta</option>
            <option value="protocolo_quirurgico">Protocolo Quirúrgico</option>
            <option value="informe_alta">Informe de Alta</option>
            <option value="carnet_vacunacion">Carnet de Vacunación</option>
            <option value="ficha_anestesia">Ficha de Anestesia</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* CATEGORÍAS SUGERIDAS */}
        {nuevoDocumento.tipo_documento && (
          <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-black text-blue-900">
                Información sobre {nuevoDocumento.tipo_documento.replace(/_/g, " ")}
              </h4>
            </div>
            <p className="text-xs font-semibold text-gray-700">
              {nuevoDocumento.tipo_documento === "historia_clinica" &&
                "Documento que contiene el registro completo de la evolución médica del paciente."}
              {nuevoDocumento.tipo_documento === "informe_medico" &&
                "Reporte detallado de una consulta, procedimiento o evaluación médica."}
              {nuevoDocumento.tipo_documento === "resultado_examen" &&
                "Resultados de exámenes de laboratorio, imagenología u otros estudios diagnósticos."}
              {nuevoDocumento.tipo_documento === "imagen_diagnostica" &&
                "Radiografías, tomografías, resonancias, ecografías u otras imágenes médicas."}
              {nuevoDocumento.tipo_documento === "receta_medica" &&
                "Prescripción de medicamentos con indicaciones de uso."}
              {nuevoDocumento.tipo_documento === "orden_medica" &&
                "Solicitud de exámenes, procedimientos o interconsultas."}
              {nuevoDocumento.tipo_documento === "certificado_medico" &&
                "Documento que certifica el estado de salud o condición médica del paciente."}
              {nuevoDocumento.tipo_documento === "epicrisis" &&
                "Resumen de hospitalización con diagnósticos, tratamientos y evolución."}
              {nuevoDocumento.tipo_documento === "consentimiento_informado" &&
                "Autorización del paciente para procedimientos médicos o tratamientos."}
            </p>
          </div>
        )}

        {/* NOMBRE DEL DOCUMENTO */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Nombre del Documento *
          </label>
          <input
            type="text"
            value={nuevoDocumento.nombre_documento}
            onChange={(e) =>
              setNuevoDocumento({ ...nuevoDocumento, nombre_documento: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
            placeholder="Ej: Hemograma completo - Enero 2024"
            required
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Descripción del Documento
          </label>
          <textarea
            value={nuevoDocumento.descripcion}
            onChange={(e) =>
              setNuevoDocumento({ ...nuevoDocumento, descripcion: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Breve descripción del contenido del documento, hallazgos relevantes, contexto..."
          ></textarea>
        </div>

        {/* FECHA DEL DOCUMENTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fecha del Documento *
            </label>
            <input
              type="date"
              value={nuevoDocumento.fecha_documento}
              onChange={(e) =>
                setNuevoDocumento({ ...nuevoDocumento, fecha_documento: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fecha de Subida
            </label>
            <input
              type="date"
              value={nuevoDocumento.fecha_subida}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 outline-none font-semibold text-gray-500"
            />
          </div>
        </div>

        {/* PROFESIONAL EMISOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Profesional Emisor
            </label>
            <input
              type="text"
              value={nuevoDocumento.profesional_emisor}
              onChange={(e) =>
                setNuevoDocumento({
                  ...nuevoDocumento,
                  profesional_emisor: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
              placeholder="Nombre del médico o profesional"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Institución
            </label>
            <input
              type="text"
              value={nuevoDocumento.institucion}
              onChange={(e) =>
                setNuevoDocumento({ ...nuevoDocumento, institucion: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
              placeholder="Hospital, clínica, laboratorio..."
            />
          </div>
        </div>

        {/* ÁREA DE SUBIDA DE ARCHIVO */}
        <div className="p-6 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition-all">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Paperclip className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-black text-gray-900 mb-2">
              Seleccionar Archivo *
            </h4>
            <p className="text-sm font-semibold text-gray-600 mb-4">
              Arrastra y suelta el archivo aquí o haz clic para seleccionar
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.txt"
              className="hidden"
              required={!nuevoDocumento.archivo}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Seleccionar Archivo
            </button>
            <p className="text-xs font-semibold text-gray-500 mt-3">
              Formatos permitidos: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX, TXT
            </p>
            <p className="text-xs font-semibold text-gray-500">
              Tamaño máximo: 10 MB
            </p>
          </div>

          {/* ARCHIVO SELECCIONADO */}
          {nuevoDocumento.archivo && (
            <div className="mt-4 p-4 rounded-lg bg-white border-2 border-indigo-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                    {nuevoDocumento.archivo.type.includes("pdf") ? (
                      <FileText className="w-5 h-5 text-white" />
                    ) : nuevoDocumento.archivo.type.includes("image") ? (
                      <ImageIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Paperclip className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {nuevoDocumento.archivo.name}
                    </p>
                    <p className="text-xs font-semibold text-gray-600">
                      {(nuevoDocumento.archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNuevoDocumento({ ...nuevoDocumento, archivo: null })
                  }
                  className="p-2 hover:bg-red-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ETIQUETAS/TAGS */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Etiquetas (Opcional)
          </label>
          <input
            type="text"
            value={nuevoDocumento.etiquetas}
            onChange={(e) =>
              setNuevoDocumento({ ...nuevoDocumento, etiquetas: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
            placeholder="Ej: urgente, cardiología, control, seguimiento (separadas por comas)"
          />
          <p className="mt-2 text-xs font-semibold text-gray-500">
            💡 Las etiquetas ayudan a organizar y buscar documentos más fácilmente
          </p>
        </div>

        {/* CONFIGURACIÓN DE PRIVACIDAD */}
        <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h4 className="text-base font-black text-purple-900">
              Configuración de Privacidad
            </h4>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoDocumento.visible_paciente}
                onChange={(e) =>
                  setNuevoDocumento({
                    ...nuevoDocumento,
                    visible_paciente: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Visible para el paciente en su portal
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoDocumento.compartir_equipo}
                onChange={(e) =>
                  setNuevoDocumento({
                    ...nuevoDocumento,
                    compartir_equipo: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Compartir con todo el equipo médico
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoDocumento.documento_confidencial}
                onChange={(e) =>
                  setNuevoDocumento({
                    ...nuevoDocumento,
                    documento_confidencial: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Marcar como documento confidencial
              </span>
            </label>
          </div>
        </div>

        {/* NOTAS ADICIONALES */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            value={nuevoDocumento.notas}
            onChange={(e) =>
              setNuevoDocumento({ ...nuevoDocumento, notas: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Información adicional sobre el documento, contexto, observaciones..."
          ></textarea>
        </div>

        {/* ALERTAS */}
        <div className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-black text-yellow-900 mb-2">
                Importante
              </h4>
              <ul className="text-xs font-semibold text-gray-700 space-y-1">
                <li>• Asegúrate de que el documento sea legible y completo</li>
                <li>• Verifica que contenga toda la información relevante</li>
                <li>• No subas documentos de otros pacientes por error</li>
                <li>• Los documentos quedan permanentemente en el historial</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t-2 border-gray-200">
          <button
            type="submit"
            disabled={guardando || !nuevoDocumento.archivo}
            className="w-full sm:flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Subir Documento
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setModalNuevoDocumento(false)}
            disabled={guardando}
            className="w-full sm:w-auto px-6 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-xl font-bold text-base transition-all"
          >
            Cancelar
          </button>
        </div>

        {/* NOTA LEGAL */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 text-center">
            📄 Los documentos subidos forman parte del expediente médico oficial del
            paciente. Asegúrate de cumplir con las normativas de protección de datos
            y confidencialidad médica.
          </p>
        </div>
      </form>
    </div>
  </div>
)}

{/* ========================================
    MODAL NUEVA CITA
    ======================================== */}
{modalNuevaCita && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-indigo-600" />
          Agendar Nueva Cita
        </h3>
        <button
          onClick={() => setModalNuevaCita(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* INFORMACIÓN DEL PACIENTE */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl">
            {paciente?.nombre[0]}{paciente?.apellido_paterno[0]}
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900">
              {paciente?.nombre_completo}
            </h4>
            <p className="text-sm font-semibold text-gray-600">
              RUT: {paciente?.rut} • {paciente?.edad} años • {paciente?.genero}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGuardarCita();
        }}
        className="space-y-6"
      >
        {/* TIPO DE CITA */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Tipo de Cita *
          </label>
          <select
            value={nuevaCita.tipo_cita}
            onChange={(e) => {
              setNuevaCita({ ...nuevaCita, tipo_cita: e.target.value });
              // Si cambia a telemedicina, establecer proveedor por defecto
              if (e.target.value === "telemedicina") {
                setNuevaCita((prev) => ({
                  ...prev,
                  proveedor_telemedicina: "anyssa_video_conference",
                  requiere_sala_virtual: true,
                }));
              } else {
                setNuevaCita((prev) => ({
                  ...prev,
                  proveedor_telemedicina: "",
                  requiere_sala_virtual: false,
                  url_sala_virtual: "",
                }));
              }
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
            required
          >
            <option value="">Seleccionar tipo de cita</option>
            <option value="consulta_general">Consulta General</option>
            <option value="control">Control</option>
            <option value="primera_vez">Primera Vez</option>
            <option value="urgencia">Urgencia</option>
            <option value="procedimiento">Procedimiento</option>
            <option value="cirugia">Cirugía</option>
            <option value="telemedicina">🎥 Telemedicina</option>
            <option value="domiciliaria">Domiciliaria</option>
            <option value="seguimiento">Seguimiento</option>
            <option value="evaluacion">Evaluación</option>
          </select>
        </div>

        {/* CONFIGURACIÓN DE TELEMEDICINA */}
        {nuevaCita.tipo_cita === "telemedicina" && (
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black text-blue-900">
                  Configuración de Telemedicina
                </h4>
                <p className="text-sm font-semibold text-blue-700">
                  Consulta médica por videollamada
                </p>
              </div>
            </div>

            {/* PROVEEDOR DE TELEMEDICINA */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-blue-900 mb-2">
                Proveedor de Videollamada *
              </label>
              <select
                value={nuevaCita.proveedor_telemedicina}
                onChange={(e) =>
                  setNuevaCita({
                    ...nuevaCita,
                    proveedor_telemedicina: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold bg-white"
                required
              >
                <option value="anyssa_video_conference">
                  🎯 Anyssa Video Conference (Recomendado)
                </option>
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
                <option value="microsoft_teams">Microsoft Teams</option>
                <option value="jitsi">Jitsi Meet</option>
                <option value="webex">Cisco Webex</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* INFORMACIÓN DEL PROVEEDOR */}
            <div className="p-4 rounded-lg bg-blue-100 border border-blue-300">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-black text-blue-900 mb-2">
                    {nuevaCita.proveedor_telemedicina === "anyssa_video_conference"
                      ? "Anyssa Video Conference"
                      : nuevaCita.proveedor_telemedicina === "zoom"
                      ? "Zoom"
                      : nuevaCita.proveedor_telemedicina === "google_meet"
                      ? "Google Meet"
                      : nuevaCita.proveedor_telemedicina === "microsoft_teams"
                      ? "Microsoft Teams"
                      : nuevaCita.proveedor_telemedicina === "jitsi"
                      ? "Jitsi Meet"
                      : nuevaCita.proveedor_telemedicina === "webex"
                      ? "Cisco Webex"
                      : "Proveedor Personalizado"}
                  </h5>
                  <ul className="text-xs font-semibold text-blue-800 space-y-1">
                    {nuevaCita.proveedor_telemedicina === "anyssa_video_conference" && (
                      <>
                        <li>✅ Integrado nativamente con Anyssa</li>
                        <li>✅ Sin necesidad de cuentas externas</li>
                        <li>✅ Grabación automática de sesiones</li>
                        <li>✅ Encriptación end-to-end</li>
                        <li>✅ Historial clínico integrado</li>
                        <li>✅ Cumple normativas de salud (HIPAA, GDPR)</li>
                      </>
                    )}
                    {nuevaCita.proveedor_telemedicina === "zoom" && (
                      <>
                        <li>• Requiere cuenta de Zoom</li>
                        <li>• Hasta 40 minutos en plan gratuito</li>
                        <li>• Buena calidad de video</li>
                      </>
                    )}
                    {nuevaCita.proveedor_telemedicina === "google_meet" && (
                      <>
                        <li>• Requiere cuenta de Google</li>
                        <li>• Integrado con Google Calendar</li>
                        <li>• Hasta 60 minutos en plan gratuito</li>
                      </>
                    )}
                    {nuevaCita.proveedor_telemedicina === "microsoft_teams" && (
                      <>
                        <li>• Requiere cuenta de Microsoft</li>
                        <li>• Integrado con Office 365</li>
                        <li>• Ideal para entornos corporativos</li>
                      </>
                    )}
                    {nuevaCita.proveedor_telemedicina === "jitsi" && (
                      <>
                        <li>• Plataforma de código abierto</li>
                        <li>• No requiere instalación</li>
                        <li>• Gratuito e ilimitado</li>
                      </>
                    )}
                    {nuevaCita.proveedor_telemedicina === "webex" && (
                      <>
                        <li>• Requiere cuenta de Cisco Webex</li>
                        <li>• Alta seguridad empresarial</li>
                        <li>• Hasta 50 minutos en plan gratuito</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* URL PERSONALIZADA (SOLO SI NO ES ANYSSA) */}
            {nuevaCita.proveedor_telemedicina !== "anyssa_video_conference" && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-blue-900 mb-2">
                  URL de la Sala Virtual (Opcional)
                </label>
                <input
                  type="url"
                  value={nuevaCita.url_sala_virtual}
                  onChange={(e) =>
                    setNuevaCita({ ...nuevaCita, url_sala_virtual: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-semibold"
                  placeholder="https://zoom.us/j/123456789 o https://meet.google.com/abc-defg-hij"
                />
                <p className="mt-2 text-xs font-semibold text-blue-700">
                  💡 Si no ingresas una URL, se generará automáticamente al confirmar la cita
                </p>
              </div>
            )}

            {/* OPCIONES ADICIONALES */}
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nuevaCita.grabar_sesion}
                  onChange={(e) =>
                    setNuevaCita({ ...nuevaCita, grabar_sesion: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-2 border-blue-400"
                  defaultChecked={
                    nuevaCita.proveedor_telemedicina === "anyssa_video_conference"
                  }
                />
                <span className="text-sm font-semibold text-blue-900">
                  Grabar sesión para el historial clínico
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nuevaCita.enviar_recordatorio_telemedicina}
                  onChange={(e) =>
                    setNuevaCita({
                      ...nuevaCita,
                      enviar_recordatorio_telemedicina: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-2 border-blue-400"
                  defaultChecked
                />
                <span className="text-sm font-semibold text-blue-900">
                  Enviar recordatorio con enlace de videollamada
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nuevaCita.sala_espera_virtual}
                  onChange={(e) =>
                    setNuevaCita({
                      ...nuevaCita,
                      sala_espera_virtual: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-2 border-blue-400"
                  defaultChecked={
                    nuevaCita.proveedor_telemedicina === "anyssa_video_conference"
                  }
                />
                <span className="text-sm font-semibold text-blue-900">
                  Habilitar sala de espera virtual
                </span>
              </label>
            </div>
          </div>
        )}

        {/* FECHA Y HORA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fecha de la Cita *
            </label>
            <input
              type="date"
              value={nuevaCita.fecha}
              onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hora de la Cita *
            </label>
            <input
              type="time"
              value={nuevaCita.hora}
              onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
              required
            />
          </div>
        </div>

        {/* DURACIÓN */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Duración Estimada (minutos) *
          </label>
          <select
            value={nuevaCita.duracion_minutos}
            onChange={(e) =>
              setNuevaCita({ ...nuevaCita, duracion_minutos: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
            required
          >
            <option value="">Seleccionar duración</option>
            <option value="15">15 minutos</option>
            <option value="20">20 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">1 hora</option>
            <option value="90">1 hora 30 minutos</option>
            <option value="120">2 horas</option>
          </select>
        </div>

        {/* MÉDICO ASIGNADO */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Médico Tratante *
          </label>
          <input
            type="text"
            value={nuevaCita.medico_nombre}
            onChange={(e) =>
              setNuevaCita({ ...nuevaCita, medico_nombre: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
            placeholder="Nombre del médico"
            defaultValue={
              usuario?.medico ? `${usuario.nombre} ${usuario.apellido_paterno}` : ""
            }
            required
          />
        </div>

        {/* ESPECIALIDAD */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Especialidad
          </label>
          <input
            type="text"
            value={nuevaCita.especialidad}
            onChange={(e) =>
              setNuevaCita({ ...nuevaCita, especialidad: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
            placeholder="Ej: Cardiología, Medicina General..."
            defaultValue={
              usuario?.medico?.especialidades?.[0]?.nombre || ""
            }
          />
        </div>

        {/* MOTIVO DE LA CITA */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Motivo de la Cita *
          </label>
          <textarea
            value={nuevaCita.motivo}
            onChange={(e) => setNuevaCita({ ...nuevaCita, motivo: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Describe brevemente el motivo de la consulta..."
            required
          ></textarea>
        </div>

        {/* ESTADO DE LA CITA */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Estado Inicial *
          </label>
          <select
            value={nuevaCita.estado}
            onChange={(e) => setNuevaCita({ ...nuevaCita, estado: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold"
            required
          >
            <option value="programada">Programada</option>
            <option value="confirmada">Confirmada</option>
            <option value="pendiente_confirmacion">Pendiente de Confirmación</option>
          </select>
        </div>

        {/* NOTAS ADICIONALES */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Notas y Observaciones
          </label>
          <textarea
            value={nuevaCita.notas}
            onChange={(e) => setNuevaCita({ ...nuevaCita, notas: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-semibold resize-none"
            rows={3}
            placeholder="Información adicional, preparación requerida, instrucciones especiales..."
          ></textarea>
        </div>

        {/* RECORDATORIOS */}
        <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-purple-600" />
            <h4 className="text-base font-black text-purple-900">
              Configuración de Recordatorios
            </h4>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevaCita.enviar_recordatorio_email}
                onChange={(e) =>
                  setNuevaCita({
                    ...nuevaCita,
                    enviar_recordatorio_email: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
                defaultChecked
              />
              <span className="text-sm font-semibold text-gray-900">
                Enviar recordatorio por correo electrónico
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevaCita.enviar_recordatorio_sms}
                onChange={(e) =>
                  setNuevaCita({
                    ...nuevaCita,
                    enviar_recordatorio_sms: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
                defaultChecked
              />
              <span className="text-sm font-semibold text-gray-900">
                Enviar recordatorio por SMS
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevaCita.enviar_recordatorio_whatsapp}
                onChange={(e) =>
                  setNuevaCita({
                    ...nuevaCita,
                    enviar_recordatorio_whatsapp: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-purple-400"
              />
              <span className="text-sm font-semibold text-gray-900">
                Enviar recordatorio por WhatsApp
              </span>
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-purple-900 mb-2">
              Enviar recordatorio con anticipación de:
            </label>
            <select
              value={nuevaCita.tiempo_recordatorio}
              onChange={(e) =>
                setNuevaCita({ ...nuevaCita, tiempo_recordatorio: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold bg-white"
            >
              <option value="15">15 minutos antes</option>
              <option value="30">30 minutos antes</option>
              <option value="60">1 hora antes</option>
              <option value="120">2 horas antes</option>
              <option value="1440">1 día antes</option>
              <option value="2880">2 días antes</option>
            </select>
          </div>
        </div>

        {/* ALERTAS */}
        <div className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-black text-yellow-900 mb-2">
                Importante
              </h4>
              <ul className="text-xs font-semibold text-gray-700 space-y-1">
                <li>• Verifica la disponibilidad del médico antes de agendar</li>
                <li>• Asegúrate de que el paciente tenga los datos de contacto actualizados</li>
                <li>
                  • Para telemedicina, confirma que el paciente tenga acceso a internet
                </li>
                <li>• Los recordatorios se enviarán automáticamente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t-2 border-gray-200">
          <button
            type="submit"
            disabled={guardando}
            className="w-full sm:flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Agendar Cita
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setModalNuevaCita(false)}
            disabled={guardando}
            className="w-full sm:w-auto px-6 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-xl font-bold text-base transition-all"
          >
            Cancelar
          </button>
        </div>

        {/* NOTA LEGAL */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 text-center">
            📅 La cita quedará registrada en la agenda del médico y del paciente. Se
            enviarán notificaciones automáticas según la configuración establecida.
            {nuevaCita.tipo_cita === "telemedicina" &&
              " El enlace de videollamada se generará automáticamente y se enviará al paciente."}
          </p>
        </div>
      </form>
    </div>
  </div>
)}




          
    </MedicoLayout>
  );
}


