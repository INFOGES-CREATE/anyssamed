"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Save,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building,
  Shield,
  Key,
  Info,
  Sparkles,
  Zap,
  Award,
  AlertTriangle,
  Camera,
  Trash2,
  Copy,
  CheckCheck,
} from "lucide-react";

// ============================================================================
// INTERFACES
// ============================================================================

interface FormData {
  // Datos básicos
  username: string;
  password: string;
  confirmar_password: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;

  // Contacto
  telefono: string;
  celular: string;
  direccion: string;
  ciudad: string;
  region: string;

  // Información personal
  fecha_nacimiento: string;
  genero: "masculino" | "femenino" | "";

  // Centro y sucursal
  id_centro_principal: string;
  id_sucursal_principal: string;

  // Estado y configuración
  estado: "activo" | "inactivo" | "bloqueado" | "pendiente_activacion";
  requiere_cambio_password: boolean;
  autenticacion_doble_factor: boolean;

  // Premium
  es_premium: boolean;
  fecha_inicio_premium: string;
  fecha_expiracion_premium: string;

  // Foto
  foto_perfil: File | null;
}

interface FormErrors {
  [key: string]: string;
}

interface Centro {
  id_centro: number;
  nombre: string;
}

interface Sucursal {
  id_sucursal: number;
  nombre: string;
  id_centro: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
];

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

function validarRUT(rut: string): boolean {
  rut = rut.replace(/\./g, "").replace(/-/g, "");
  if (rut.length < 2) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dv === dvCalculado;
}

function formatearRUT(rut: string): string {
  rut = rut.replace(/\./g, "").replace(/-/g, "");
  if (rut.length < 2) return rut;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);

  let cuerpoFormateado = "";
  let contador = 0;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    if (contador === 3) {
      cuerpoFormateado = "." + cuerpoFormateado;
      contador = 0;
    }
    cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    contador++;
  }

  return `${cuerpoFormateado}-${dv}`;
}

function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function calcularFortalezaPassword(password: string): {
  fortaleza: number;
  texto: string;
  color: string;
} {
  let fortaleza = 0;

  if (password.length >= 8) fortaleza += 20;
  if (password.length >= 12) fortaleza += 10;
  if (/[a-z]/.test(password)) fortaleza += 20;
  if (/[A-Z]/.test(password)) fortaleza += 20;
  if (/[0-9]/.test(password)) fortaleza += 20;
  if (/[^a-zA-Z0-9]/.test(password)) fortaleza += 10;

  let texto = "";
  let color = "";

  if (fortaleza < 40) {
    texto = "Muy débil";
    color = "bg-red-500";
  } else if (fortaleza < 60) {
    texto = "Débil";
    color = "bg-orange-500";
  } else if (fortaleza < 80) {
    texto = "Media";
    color = "bg-yellow-500";
  } else if (fortaleza < 100) {
    texto = "Fuerte";
    color = "bg-green-500";
  } else {
    texto = "Muy fuerte";
    color = "bg-emerald-500";
  }

  return { fortaleza, texto, color };
}

function generarPasswordSegura(): string {
  const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const minusculas = "abcdefghijklmnopqrstuvwxyz";
  const numeros = "0123456789";
  const especiales = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const todos = mayusculas + minusculas + numeros + especiales;

  let password = "";
  password += mayusculas[Math.floor(Math.random() * mayusculas.length)];
  password += minusculas[Math.floor(Math.random() * minusculas.length)];
  password += numeros[Math.floor(Math.random() * numeros.length)];
  password += especiales[Math.floor(Math.random() * especiales.length)];

  for (let i = 0; i < 8; i++) {
    password += todos[Math.floor(Math.random() * todos.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function generarUsername(nombre: string, apellido: string): string {
  const nombreLimpio = nombre.toLowerCase().trim().replace(/\s+/g, "");
  const apellidoLimpio = apellido.toLowerCase().trim().replace(/\s+/g, "");

  const opciones = [
    `${nombreLimpio}.${apellidoLimpio}`,
    `${nombreLimpio[0]}${apellidoLimpio}`,
    `${nombreLimpio}${apellidoLimpio[0]}`,
    `${apellidoLimpio}.${nombreLimpio}`,
  ];

  return opciones[0];
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function NuevoUsuarioPage() {
  const params = useParams();
  const router = useRouter();

  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    confirmar_password: "",
    email: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    rut: "",
    telefono: "",
    celular: "",
    direccion: "",
    ciudad: "",
    region: "",
    fecha_nacimiento: "",
    genero: "",
    id_centro_principal: params.id as string || "",
    id_sucursal_principal: "",
    estado: "pendiente_activacion",
    requiere_cambio_password: true,
    autenticacion_doble_factor: false,
    es_premium: false,
    fecha_inicio_premium: "",
    fecha_expiracion_premium: "",
    foto_perfil: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalesFiltradas, setSucursalesFiltradas] = useState<Sucursal[]>([]);
  const [passwordGenerada, setPasswordGenerada] = useState("");
  const [usernameGenerado, setUsernameGenerado] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<
    "basica" | "contacto" | "personal" | "configuracion" | "premium"
  >("basica");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    cargarCentrosYSucursales();
  }, []);

  useEffect(() => {
    if (formData.id_centro_principal) {
      const sucursalesFiltradas = sucursales.filter(
        (s) => s.id_centro === parseInt(formData.id_centro_principal)
      );
      setSucursalesFiltradas(sucursalesFiltradas);
    } else {
      setSucursalesFiltradas([]);
    }
  }, [formData.id_centro_principal, sucursales]);

  useEffect(() => {
    if (formData.nombre && formData.apellido_paterno && !usernameGenerado) {
      const username = generarUsername(formData.nombre, formData.apellido_paterno);
      setFormData((prev) => ({ ...prev, username }));
    }
  }, [formData.nombre, formData.apellido_paterno]);

  // ============================================================================
  // FUNCIONES DE CARGA
  // ============================================================================

  const cargarCentrosYSucursales = async () => {
    try {
      const [centrosRes, sucursalesRes] = await Promise.all([
        fetch("/api/admin/centros"),
        fetch("/api/admin/sucursales"),
      ]);

      const centrosData = await centrosRes.json();
      const sucursalesData = await sucursalesRes.json();

      if (centrosData.success) setCentros(centrosData.data);
      if (sucursalesData.success) setSucursales(sucursalesData.data);
    } catch (error) {
      console.error("Error al cargar centros y sucursales:", error);
    }
  };

  // ============================================================================
  // VALIDACIONES
  // ============================================================================

  const validarFormulario = (): boolean => {
    const nuevosErrors: FormErrors = {};

    // Validar username
    if (!formData.username.trim()) {
      nuevosErrors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      nuevosErrors.username = "Debe tener al menos 3 caracteres";
    }

    // Validar password
    if (!formData.password) {
      nuevosErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      nuevosErrors.password = "Debe tener al menos 8 caracteres";
    }

    // Validar confirmación de password
    if (formData.password !== formData.confirmar_password) {
      nuevosErrors.confirmar_password = "Las contraseñas no coinciden";
    }

    // Validar email
    if (!formData.email.trim()) {
      nuevosErrors.email = "El email es requerido";
    } else if (!validarEmail(formData.email)) {
      nuevosErrors.email = "Email inválido";
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      nuevosErrors.nombre = "El nombre es requerido";
    }

    // Validar apellido paterno
    if (!formData.apellido_paterno.trim()) {
      nuevosErrors.apellido_paterno = "El apellido paterno es requerido";
    }

    // Validar RUT
    if (!formData.rut.trim()) {
      nuevosErrors.rut = "El RUT es requerido";
    } else if (!validarRUT(formData.rut)) {
      nuevosErrors.rut = "RUT inválido";
    }

    // Validar fechas premium si está activo
    if (formData.es_premium) {
      if (!formData.fecha_inicio_premium) {
        nuevosErrors.fecha_inicio_premium = "Fecha de inicio requerida";
      }
      if (!formData.fecha_expiracion_premium) {
        nuevosErrors.fecha_expiracion_premium = "Fecha de expiración requerida";
      }
    }

    setErrors(nuevosErrors);
    return Object.keys(nuevosErrors).length === 0;
  };

  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-formatear RUT
    if (name === "rut") {
      const rutFormateado = formatearRUT(value);
      setFormData((prev) => ({ ...prev, rut: rutFormateado }));
    }

    // Marcar que el username fue generado manualmente
    if (name === "username") {
      setUsernameGenerado(true);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          foto_perfil: "La imagen debe ser menor a 5MB",
        }));
        return;
      }

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          foto_perfil: "El archivo debe ser una imagen",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, foto_perfil: file }));

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Limpiar error
      if (errors.foto_perfil) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.foto_perfil;
          return newErrors;
        });
      }
    }
  };

  const handleEliminarFoto = () => {
    setFormData((prev) => ({ ...prev, foto_perfil: null }));
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerarPassword = () => {
    const password = generarPasswordSegura();
    setPasswordGenerada(password);
    setFormData((prev) => ({
      ...prev,
      password,
      confirmar_password: password,
    }));

    // Limpiar errores de password
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.password;
      delete newErrors.confirmar_password;
      return newErrors;
    });
  };

  const handleCopiarPassword = async () => {
    if (passwordGenerada) {
      try {
        await navigator.clipboard.writeText(passwordGenerada);
        alert("Contraseña copiada al portapapeles");
      } catch (error) {
        console.error("Error al copiar:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      // Ir a la primera sección con error
      const primeraSeccionConError = obtenerPrimeraSeccionConError();
      if (primeraSeccionConError) {
        setSeccionActiva(primeraSeccionConError);
      }
      return;
    }

    try {
      setLoading(true);

      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();

      // Agregar todos los campos
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "foto_perfil" && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== null && value !== "") {
          formDataToSend.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/centros/${params.id}/usuarios/nuevo`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        alert("Usuario creado exitosamente");
        router.push(`/admin/centros/${params.id}/usuarios`);
      } else {
        alert(`Error: ${data.error}`);
        if (data.validationErrors) {
          setErrors(data.validationErrors);
        }
      }
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      alert(`Error al crear usuario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const obtenerPrimeraSeccionConError = (): typeof seccionActiva | null => {
    const seccionesCampos = {
      basica: ["username", "password", "confirmar_password", "email"],
      contacto: ["nombre", "apellido_paterno", "apellido_materno", "rut"],
      personal: ["telefono", "celular", "direccion", "ciudad", "region", "fecha_nacimiento", "genero"],
      configuracion: ["id_centro_principal", "id_sucursal_principal", "estado"],
      premium: ["fecha_inicio_premium", "fecha_expiracion_premium"],
    };

    for (const [seccion, campos] of Object.entries(seccionesCampos)) {
      if (campos.some((campo) => errors[campo])) {
        return seccion as typeof seccionActiva;
      }
    }

    return null;
  };

  // ============================================================================
  // COMPONENTES DE UI
  // ============================================================================

  const fortalezaPassword = calcularFortalezaPassword(formData.password);

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    icon: Icon,
    placeholder,
    autoComplete,
  }: {
    label: string;
    name: keyof FormData;
    type?: string;
    required?: boolean;
    icon?: any;
    placeholder?: string;
    autoComplete?: string;
  }) => (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          type={type}
          name={name as string}
          value={formData[name] as string}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full ${
            Icon ? "pl-12" : "pl-4"
          } pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 font-semibold ${
            errors[name as string]
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
          }`}
        />
      </div>
      {errors[name as string] && (
        <p className="mt-2 text-sm text-red-600 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errors[name as string]}
        </p>
      )}
    </div>
  );

  const SelectField = ({
    label,
    name,
    options,
    required = false,
    icon: Icon,
    placeholder = "Seleccionar...",
  }: {
    label: string;
    name: keyof FormData;
    options: { value: string | number; label: string }[];
    required?: boolean;
    icon?: any;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
        )}
        <select
          name={name as string}
          value={formData[name] as string}
          onChange={handleChange}
          className={`w-full ${
            Icon ? "pl-12" : "pl-4"
          } pr-10 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 font-bold appearance-none bg-white ${
            errors[name as string]
              ? "border-red-300 bg-red-50"
              : "border-gray-200"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {errors[name as string] && (
        <p className="mt-2 text-sm text-red-600 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errors[name as string]}
        </p>
      )}
    </div>
  );

  const CheckboxField = ({
    label,
    name,
    description,
  }: {
    label: string;
    name: keyof FormData;
    description?: string;
  }) => (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name as string}
        checked={formData[name] as boolean}
        onChange={handleChange}
        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-4 focus:ring-blue-200 mt-1"
      />
      <div>
        <label className="text-sm font-bold text-gray-900">{label}</label>
        {description && (
          <p className="text-xs text-gray-600 font-semibold mt-1">{description}</p>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.6);
        }
      `}</style>

      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl top-0 left-0 animate-float"></div>
        <div
          className="absolute w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-3xl bottom-0 right-0 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/centros/${params.id}/usuarios`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-bold transition-all duration-300 hover:translate-x-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="border-b-2 border-transparent group-hover:border-blue-600">
              Volver a Usuarios
            </span>
          </Link>

          <div className="flex items-center gap-5 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/50 animate-gradient">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-2">
                Crear Nuevo Usuario
              </h1>
              <p className="text-gray-600 font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Complete el formulario para agregar un nuevo usuario al sistema
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Navegación de pestañas */}
          <div className="glassmorphism rounded-2xl p-2 mb-6 shadow-xl">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "basica", label: "Acceso", icon: Lock },
                { id: "contacto", label: "Datos Personales", icon: User },
                { id: "personal", label: "Contacto", icon: Phone },
                { id: "configuracion", label: "Configuración", icon: Shield },
                { id: "premium", label: "Premium", icon: Award },
              ].map((seccion) => {
                const Icon = seccion.icon;
                const tieneError = Object.keys(errors).some((key) => {
                  const seccionesCampos = {
                    basica: ["username", "password", "confirmar_password", "email"],
                    contacto: ["nombre", "apellido_paterno", "apellido_materno", "rut"],
                    personal: ["telefono", "celular", "direccion", "ciudad", "region", "fecha_nacimiento"],
                    configuracion: ["id_centro_principal", "id_sucursal_principal"],
                    premium: ["fecha_inicio_premium", "fecha_expiracion_premium"],
                  };
                  return seccionesCampos[seccion.id as keyof typeof seccionesCampos]?.includes(key);
                });

                return (
                  <button
                    key={seccion.id}
                    type="button"
                    onClick={() => setSeccionActiva(seccion.id as typeof seccionActiva)}
                    className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                      seccionActiva === seccion.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {seccion.label}
                    {tieneError && (
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido de las secciones */}
          <div className="glassmorphism rounded-2xl p-8 shadow-2xl">
            {/* ======================================================================== */}
            {/* SECCIÓN: INFORMACIÓN BÁSICA DE ACCESO */}
            {/* ======================================================================== */}
            {seccionActiva === "basica" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Información de Acceso
                    </h2>
                    <p className="text-gray-600 font-semibold">
                      Credenciales de inicio de sesión
                    </p>
                  </div>
                </div>

                {/* Foto de perfil */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    Foto de Perfil
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {fotoPreview ? (
                        <div className="relative group">
                          <img
                            src={fotoPreview}
                            alt="Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                          />
                          <button
                            type="button"
                            onClick={handleEliminarFoto}
                            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center border-4 border-white shadow-xl">
                          <Camera className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="hidden"
                        id="foto-upload"
                      />
                      <label
                        htmlFor="foto-upload"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 font-bold cursor-pointer"
                      >
                        <Upload className="w-5 h-5" />
                        Subir Foto
                      </label>
                      <p className="text-xs text-gray-600 font-semibold mt-2">
                        Máximo 5MB. Formatos: JPG, PNG, GIF
                      </p>
                      {errors.foto_perfil && (
                        <p className="mt-2 text-sm text-red-600 font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.foto_perfil}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div>
                    <InputField
                      label="Nombre de Usuario"
                      name="username"
                      required
                      icon={User}
                      placeholder="juan.perez"
                      autoComplete="username"
                    />
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 font-semibold">
                      <Info className="w-4 h-4" />
                      Se genera automáticamente desde el nombre
                    </div>
                  </div>

                  {/* Email */}
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    icon={Mail}
                    placeholder="usuario@ejemplo.com"
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      className={`w-full pl-12 pr-24 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 font-semibold ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Indicador de fortaleza */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">
                          Fortaleza:
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                          {fortalezaPassword.texto}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${fortalezaPassword.color} transition-all duration-300`}
                          style={{ width: `${fortalezaPassword.fortaleza}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}

                  {/* Botón generar password */}
                  <button
                    type="button"
                    onClick={handleGenerarPassword}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-bold"
                  >
                    <Zap className="w-4 h-4" />
                    Generar Contraseña Segura
                  </button>
                </div>

                {/* Confirmar Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmar_password"
                      value={formData.confirmar_password}
                      onChange={handleChange}
                      placeholder="Repita la contraseña"
                      autoComplete="new-password"
                      className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 font-semibold ${
                        errors.confirmar_password
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmar_password && (
                    <p className="mt-2 text-sm text-red-600 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmar_password}
                    </p>
                  )}
                  {formData.password &&
                    formData.confirmar_password &&
                    formData.password === formData.confirmar_password && (
                      <p className="mt-2 text-sm text-green-600 font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Las contraseñas coinciden
                      </p>
                    )}
                </div>

                {/* Contraseña generada */}
                {passwordGenerada && (
                  <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-green-800 mb-2">
                          Contraseña generada:
                        </p>
                        <code className="text-lg font-mono font-bold text-green-900 bg-white px-4 py-2 rounded-lg border-2 border-green-200">
                          {passwordGenerada}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopiarPassword}
                        className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all hover:scale-110"
                        title="Copiar contraseña"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-green-700 font-semibold mt-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Guarde esta contraseña en un lugar seguro. El usuario deberá cambiarla en
                      su primer inicio de sesión.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================================== */}
            {/* SECCIÓN: DATOS PERSONALES */}
            {/* ======================================================================== */}
            {seccionActiva === "contacto" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Datos Personales
                    </h2>
                    <p className="text-gray-600 font-semibold">
                      Información personal del usuario
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Nombre"
                    name="nombre"
                    required
                    icon={User}
                    placeholder="Juan"
                    autoComplete="given-name"
                  />

                  <InputField
                    label="Apellido Paterno"
                    name="apellido_paterno"
                    required
                    icon={User}
                    placeholder="Pérez"
                    autoComplete="family-name"
                  />

                  <InputField
                    label="Apellido Materno"
                    name="apellido_materno"
                    icon={User}
                    placeholder="González"
                    autoComplete="family-name"
                  />

                  <InputField
                    label="RUT"
                    name="rut"
                    required
                    icon={Shield}
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>
            )}

            {/* ======================================================================== */}
            {/* SECCIÓN: INFORMACIÓN DE CONTACTO */}
            {/* ======================================================================== */}
            {seccionActiva === "personal" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Información de Contacto
                    </h2>
                    <p className="text-gray-600 font-semibold">
                      Datos de contacto y ubicación
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Teléfono"
                    name="telefono"
                    type="tel"
                    icon={Phone}
                    placeholder="+56 2 2345 6789"
                    autoComplete="tel"
                  />

                  <InputField
                    label="Celular"
                    name="celular"
                    type="tel"
                    icon={Phone}
                    placeholder="+56 9 1234 5678"
                    autoComplete="tel"
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Dirección"
                      name="direccion"
                      icon={MapPin}
                      placeholder="Av. Libertador Bernardo O'Higgins 123"
                      autoComplete="street-address"
                    />
                  </div>

                  <InputField
                    label="Ciudad"
                    name="ciudad"
                    icon={MapPin}
                    placeholder="Santiago"
                    autoComplete="address-level2"
                  />

                  <SelectField
                    label="Región"
                    name="region"
                    icon={MapPin}
                    options={REGIONES_CHILE.map((r) => ({ value: r, label: r }))}
                  />

                  <InputField
                    label="Fecha de Nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    icon={Calendar}
                  />

                  <SelectField
                    label="Género"
                    name="genero"
                    icon={User}
                    options={[
                      { value: "masculino", label: "Masculino" },
                      { value: "femenino", label: "Femenino" },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* ======================================================================== */}
            {/* SECCIÓN: CONFIGURACIÓN */}
            {/* ======================================================================== */}
            {seccionActiva === "configuracion" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Configuración del Usuario
                    </h2>
                    <p className="text-gray-600 font-semibold">
                      Centro, sucursal y permisos
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Centro Principal"
                    name="id_centro_principal"
                    icon={Building}
                    options={centros.map((c) => ({
                      value: c.id_centro,
                      label: c.nombre,
                    }))}
                  />

                  <SelectField
                    label="Sucursal Principal"
                    name="id_sucursal_principal"
                    icon={Building}
                    options={sucursalesFiltradas.map((s) => ({
                      value: s.id_sucursal,
                      label: s.nombre,
                    }))}
                    placeholder={
                      !formData.id_centro_principal
                        ? "Seleccione primero un centro"
                        : "Seleccionar..."
                    }
                  />

                  <SelectField
                    label="Estado Inicial"
                    name="estado"
                    required
                    icon={Shield}
                    options={[
                      { value: "activo", label: "✅ Activo" },
                      { value: "inactivo", label: "⚠️ Inactivo" },
                      { value: "bloqueado", label: "🚫 Bloqueado" },
                      {
                        value: "pendiente_activacion",
                        label: "⏳ Pendiente Activación",
                      },
                    ]}
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 space-y-4">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Opciones de Seguridad
                  </h3>

                  <CheckboxField
                    label="Requiere Cambio de Contraseña"
                    name="requiere_cambio_password"
                    description="El usuario deberá cambiar su contraseña en el primer inicio de sesión"
                  />

                  <CheckboxField
                    label="Autenticación de Doble Factor (2FA)"
                    name="autenticacion_doble_factor"
                    description="Habilita la verificación en dos pasos para mayor seguridad"
                  />
                </div>
              </div>
            )}

            {/* ======================================================================== */}
            {/* SECCIÓN: PREMIUM */}
            {/* ======================================================================== */}
            {seccionActiva === "premium" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Configuración Premium
                    </h2>
                    <p className="text-gray-600 font-semibold">
                      Acceso a funcionalidades exclusivas
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
                  <CheckboxField
                    label="Usuario Premium"
                    name="es_premium"
                    description="Otorga acceso a características premium del sistema"
                  />
                </div>

                {formData.es_premium && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <InputField
                      label="Fecha de Inicio Premium"
                      name="fecha_inicio_premium"
                      type="date"
                      required={formData.es_premium}
                      icon={Calendar}
                    />

                    <InputField
                      label="Fecha de Expiración Premium"
                      name="fecha_expiracion_premium"
                      type="date"
                      required={formData.es_premium}
                      icon={Calendar}
                    />
                  </div>
                )}

                {!formData.es_premium && (
                  <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl text-center">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold">
                      Marque la casilla "Usuario Premium" para configurar las fechas de
                      acceso
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between gap-4 mt-8">
            <Link
              href={`/admin/centros/${params.id}/usuarios`}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 font-bold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </Link>

            <div className="flex items-center gap-4">
              {/* Indicador de progreso */}
              <div className="text-sm font-semibold text-gray-600">
                {Object.keys(errors).length > 0 && (
                  <span className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {Object.keys(errors).length} error(es) por corregir
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-black text-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-400/50 animate-gradient"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Creando Usuario...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Crear Usuario
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}