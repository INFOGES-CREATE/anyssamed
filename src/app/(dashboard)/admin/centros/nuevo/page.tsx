"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Save,
  X,
  FileText,
  MapPin,
  Settings,
  Sparkles,
  Mail,
  Phone,
  Globe,
  Clock,
  Calendar,
  Users,
  Shield,
  AlertCircle,
  Moon,
  Sun,
  CheckCircle,
  Flag,
  Zap,
  Crown,
  TrendingUp,
} from "lucide-react";

// ==============================
// Tipos auxiliares
// ==============================
interface Pais {
  id_pais: string;
  nombre: string;
  codigo_iso2?: string | null;
  phone_code?: string | null;
  bandera_url?: string | null;
  prioridad?: number;
  activo?: number;
}

interface Region {
  id_region: string;
  id_pais: string;
  nombre: string;
  codigo?: string;
  abreviatura?: string;
  activo?: number;
  prioridad?: number;
}

interface Comuna {
  id_comuna: string;
  id_region: string;
  nombre: string;
  codigo: string | null;
  activo: number;
}

interface PlanInfo {
  id: "basico" | "profesional" | "enterprise";
  nombre: string;
  descripcion: string;
  precio: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

type FormInputChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

type ThemeMode = "light" | "dark";

// ==============================
// Planes disponibles
// ==============================
const PLANES: Record<string, PlanInfo> = {
  basico: {
    id: "basico",
    nombre: "Básico",
    descripcion: "Para consultorios pequeños",
    precio: "$0",
    features: [
      "Hasta 50 pacientes/día",
      "1 usuario administrativo",
      "Reportes básicos",
      "Soporte por email",
    ],
    icon: <Shield className="w-6 h-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  profesional: {
    id: "profesional",
    nombre: "Profesional",
    descripcion: "Para clínicas medianas",
    precio: "$99/mes",
    features: [
      "Hasta 100 pacientes/día",
      "5 usuarios administrativos",
      "Reportes avanzados",
      "Soporte prioritario",
      "Integración con laboratorios",
    ],
    icon: <Zap className="w-6 h-6" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  enterprise: {
    id: "enterprise",
    nombre: "Enterprise",
    descripcion: "Para hospitales grandes",
    precio: "Personalizado",
    features: [
      "Capacidad ilimitada",
      "Usuarios ilimitados",
      "Reportes personalizados",
      "Soporte 24/7 dedicado",
      "API completa",
      "Integraciones personalizadas",
    ],
    icon: <Crown className="w-6 h-6" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
};

// ==============================
// Componentes de UI reutilizables
// ==============================

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  icon: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  value: string | number;
  onChange: (e: FormInputChangeEvent) => void;
  disabled?: boolean;
  darkMode: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  icon: Icon,
  placeholder,
  required = false,
  value,
  onChange,
  disabled = false,
  darkMode,
}) => (
  <div className="group">
    <label
      className={`block text-sm font-black mb-2 uppercase tracking-wide ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
          darkMode
            ? "text-gray-500 group-focus-within:text-blue-400"
            : "text-gray-400 group-focus-within:text-blue-600"
        }`}
      >
        {Icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
          darkMode
            ? "bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50"
            : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
        }`}
      />
    </div>
  </div>
);

interface SelectFieldProps {
  label: string;
  name: string;
  icon: React.ReactNode;
  options: { value: string | number; label: string }[];
  value: string | number;
  onChange: (e: FormInputChangeEvent) => void;
  disabled?: boolean;
  required?: boolean;
  darkMode: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  icon: Icon,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  darkMode,
}) => (
  <div className="group">
    <label
      className={`block text-sm font-black mb-2 uppercase tracking-wide ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${
          darkMode
            ? "text-gray-500 group-focus-within:text-blue-400"
            : "text-gray-400 group-focus-within:text-blue-600"
        }`}
      >
        {Icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`appearance-none w-full pl-12 pr-9 py-4 rounded-xl outline-none transition-all duration-300 font-semibold cursor-pointer border-2 ${
          darkMode
            ? "bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50"
            : "bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
          darkMode ? "text-gray-500" : "text-gray-400"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  gradient: string;
  darkMode: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  gradient,
  darkMode,
}) => (
  <div className={`${gradient} p-6`}>
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-xl ${
          darkMode ? "bg-white/20" : "bg-white/20"
        } backdrop-blur-xl`}
      >
        <div className="w-6 h-6 text-white">{Icon}</div>
      </div>
      <h2 className="text-2xl font-black text-white">{title}</h2>
    </div>
  </div>
);

interface CardSectionProps {
  icon: React.ReactNode;
  title: string;
  gradient: string;
  darkMode: boolean;
  children: React.ReactNode;
}

const CardSection: React.FC<CardSectionProps> = ({
  icon,
  title,
  gradient,
  darkMode,
  children,
}) => (
  <div
    className={`rounded-2xl shadow-xl border overflow-hidden ${
      darkMode
        ? "bg-gray-800/50 backdrop-blur-xl border-gray-700"
        : "bg-white/80 backdrop-blur-xl border-white/50"
    }`}
  >
    <SectionHeader
      icon={icon}
      title={title}
      gradient={gradient}
      darkMode={darkMode}
    />
    <div className="p-6 md:p-8">{children}</div>
  </div>
);

// ==============================
// Página principal
// ==============================
export default function NuevoCentroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [theme, setTheme] = useState<ThemeMode>("light");
  const darkMode = theme === "dark";

  const [activeTab, setActiveTab] = useState<
    "basico" | "ubicacion" | "config" | "plan"
  >("basico");

  // ==============================
  // Estado form - alineado con la tabla
  // ==============================
  const [formData, setFormData] = useState({
    // Campos obligatorios (NOT NULL)
    nombre: "",
    razon_social: "",
    rut: "",
    direccion: "",
    ciudad: "",
    telefono_principal: "",
    email_contacto: "",
    horario_apertura: "08:00",
    horario_cierre: "20:00",
    estado: "activo" as "activo" | "inactivo" | "suspendido",

    // Campos opcionales
    pais: "",
    region: "",
    comuna: "",
    codigo_postal: "",
    telefono_secundario: "",
    email_secundario: "",
    sitio_web: "",
    logo_url: "",
    descripcion: "",
    dias_atencion: "Lunes a Viernes",
    plan: "basico" as "basico" | "profesional" | "enterprise",
    fecha_inicio_operacion: new Date().toISOString().split("T")[0],
    capacidad_pacientes_dia: 50,
    nivel_complejidad: "media" as "baja" | "media" | "alta",
    especializacion_principal: "",
    tipo_establecimiento: "clinica" as
      | "hospital"
      | "clinica"
      | "consultorio"
      | "laboratorio"
      | "centro_salud"
      | "otro",

    // IDs para geolocalización
    id_pais: "",
    id_region: "",
    id_comuna: 0,
  });

  // ==============================
  // Estado geo
  // ==============================
  const [paises, setPaises] = useState<Pais[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // ==============================
  // Cargar países
  // ==============================
  const cargarPaises = async () => {
    try {
      setLoadingGeo(true);
      const response = await fetch(`/api/geo/paises`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaises(data.paises || []);
        }
      }
    } catch (err) {
      console.error("❌ Error al cargar países:", err);
      setError("Error al cargar países");
    } finally {
      setLoadingGeo(false);
    }
  };

  // ==============================
  // Cargar regiones por país
  // ==============================
  const cargarRegiones = async (idPais: string) => {
    try {
      const response = await fetch(`/api/geo/regiones?id_pais=${idPais}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRegiones(data.regiones || []);
          setComunas([]);
        }
      }
    } catch (err) {
      console.error("❌ Error al cargar regiones:", err);
    }
  };

  // ==============================
  // Cargar comunas por región
  // ==============================
  const cargarComunas = async (idPais: string, regionNombre: string) => {
    setComunas([]);

    if (!idPais || !regionNombre) return;

    const paisObj = paises.find((p) => String(p.id_pais) === String(idPais));

    if (!paisObj) {
      console.warn("País no encontrado para cargar comunas");
      return;
    }

    const nombrePais = paisObj.nombre;

    try {
      const response = await fetch(
        `/api/geo/comunas?country=${encodeURIComponent(
          nombrePais
        )}&state=${encodeURIComponent(regionNombre)}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setComunas(data.comunas);
      } else {
        console.error("Error cargando comunas:", data.error);
      }
    } catch (err) {
      console.error("Error en cargarComunas:", err);
    }
  };

  // ==============================
  // useEffect inicial
  // ==============================
  useEffect(() => {
    cargarPaises();
  }, []);

  // Tema persistente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(
        "centros-nuevo-theme"
      ) as ThemeMode | null;
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("centros-nuevo-theme", theme);
    }
  }, [theme]);

  // ==============================
  // Handle Change
  // ==============================
  const handleChange = (e: FormInputChangeEvent) => {
    const { name, value } = e.target;

    // País (select)
    if (name === "id_pais") {
      const paisSeleccionado = paises.find(
        (p) => String(p.id_pais) === String(value)
      );

      setFormData((prev) => ({
        ...prev,
        id_pais: value,
        pais: paisSeleccionado?.nombre || "",
        id_region: "",
        id_comuna: 0,
        region: "",
        comuna: "",
      }));

      if (value.trim() !== "") {
        cargarRegiones(value);
      } else {
        setRegiones([]);
        setComunas([]);
      }
      return;
    }

    // Región (select) → rellena id_region y region (texto)
    if (name === "id_region") {
      const paisActual = formData.id_pais;
      const regionSeleccionada = regiones.find(
        (r) => String(r.id_region) === String(value)
      );
      const regionNombre = regionSeleccionada?.nombre || "";

      setFormData((prev) => ({
        ...prev,
        id_region: value,
        region: regionNombre,
        id_comuna: 0,
        comuna: "",
      }));

      if (value.trim() !== "" && paisActual) {
        cargarComunas(paisActual, regionNombre);
      } else {
        setComunas([]);
      }
      return;
    }

    // Comuna (select) → rellena id_comuna y comuna (texto)
    if (name === "id_comuna") {
      const comunaSeleccionada = comunas.find(
        (c) => String(c.id_comuna) === String(value)
      );

      setFormData((prev) => ({
        ...prev,
        id_comuna: Number(value) || 0,
        comuna: comunaSeleccionada?.nombre || "",
      }));
      return;
    }

    // Capacidad (number)
    if (name === "capacidad_pacientes_dia") {
      setFormData((prev) => ({
        ...prev,
        capacidad_pacientes_dia: Number(value) || 0,
      }));
      return;
    }

    // Cualquier otro input
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // Validaciones
  // ==============================
  const validarFormulario = (): boolean => {
    if (!formData.nombre.trim()) {
      setError("El nombre del centro es requerido");
      return false;
    }

    if (!formData.razon_social.trim()) {
      setError("La razón social es requerida");
      return false;
    }

    if (!formData.rut.trim()) {
      setError("El RUT es requerido");
      return false;
    }

    if (!formData.direccion.trim()) {
      setError("La dirección es requerida");
      return false;
    }

    if (!formData.ciudad.trim()) {
      setError("La ciudad es requerida");
      return false;
    }

    // Región: ahora viene desde el select (id_region → region)
    if (!formData.region.trim()) {
      setError("La región es requerida");
      return false;
    }

    if (!formData.telefono_principal.trim()) {
      setError("El teléfono principal es requerido");
      return false;
    }

    if (!formData.email_contacto.trim()) {
      setError("El email de contacto es requerido");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_contacto)) {
      setError("El email no es válido");
      return false;
    }

    if (!formData.rut || formData.rut.length < 8) {
      setError("Formato de RUT inválido");
      return false;
    }

    return true;
  };

  // ==============================
  // Handle Submit
  // ==============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const paisSeleccionado = paises.find(
        (p) => String(p.id_pais) === String(formData.id_pais)
      );

      const payload = {
        // Campos obligatorios
        nombre: formData.nombre.trim(),
        razon_social: formData.razon_social.trim(),
        rut: formData.rut.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        region: formData.region.trim(),
        telefono: formData.telefono_principal.trim(), // backend espera "telefono"
        email: formData.email_contacto.trim(), // backend espera "email"
        horario_apertura: formData.horario_apertura,
        horario_cierre: formData.horario_cierre,
        estado: formData.estado,

        // Campos opcionales
        pais: paisSeleccionado?.nombre || null,
        comuna: formData.comuna || null,
        codigo_postal: formData.codigo_postal || null,
        telefono_secundario: formData.telefono_secundario || null,
        email_secundario: formData.email_secundario || null,
        sitio_web: formData.sitio_web || null,
        logo_url: formData.logo_url || null,
        descripcion: formData.descripcion || null,
        dias_atencion: formData.dias_atencion,
        plan: formData.plan,
        fecha_inicio_operacion: formData.fecha_inicio_operacion,
        capacidad_pacientes_dia: formData.capacidad_pacientes_dia || null,
        nivel_complejidad: formData.nivel_complejidad,
        especializacion_principal:
          formData.especializacion_principal || null,
        tipo_establecimiento: formData.tipo_establecimiento,

        // IDs de geolocalización
        id_pais: formData.id_pais || null,
        id_region: formData.id_region || null,
        id_comuna: formData.id_comuna || null,

        // Campo obligatorio (ajusta con tu auth real)
        created_by: 1,
      };

      console.log("📤 Payload enviado:", payload);

      const response = await fetch("/api/admin/centros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("✅ Centro creado exitosamente");
        setTimeout(() => {
          router.push("/admin/centros");
        }, 1500);
      } else {
        setError(data.error || "Error al crear centro");
        console.error("❌ Error de API:", data);
      }
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Render
  // ==============================
  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      } p-4 md:p-6 lg:p-8`}
    >
      {/* Fondo animado tipo "premium" */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        {darkMode ? (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-700/50 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-700/50 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-700/40 rounded-full blur-3xl animate-pulse"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full blur-3xl animate-pulse"></div>
          </>
        )}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header Premium */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/admin/centros"
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-gray-800/50 backdrop-blur-xl border-gray-700 text-indigo-400"
                  : "bg-white/80 backdrop-blur-xl border-white/50 text-indigo-600"
              } font-bold`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Volver a Centros
            </Link>

            <button
              onClick={() => setTheme(darkMode ? "light" : "dark")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:scale-110 ${
                darkMode
                  ? "bg-gray-800 text-yellow-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {darkMode ? (
                <>
                  <Sun className="w-5 h-5" />
                  <span className="hidden sm:inline">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span className="hidden sm:inline">Oscuro</span>
                </>
              )}
            </button>
          </div>

          {/* Hero Header */}
          <div
            className={`relative overflow-hidden rounded-3xl shadow-2xl p-8 md:p-10 border ${
              darkMode
                ? "bg-gradient-to-r from-indigo-900/70 to-purple-900/70 border-indigo-500/20"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-indigo-200"
            }`}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div
                className={`p-4 rounded-2xl shadow-xl ${
                  darkMode ? "bg-white/20" : "bg-white/20"
                } backdrop-blur-xl`}
              >
                <Building2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                  Crear Nuevo Centro Médico
                </h1>
                <p className="text-base md:text-lg text-white/90 font-medium flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Completa la información para registrar un nuevo centro en el
                  sistema
                </p>
              </div>
              <div
                className={`hidden md:flex flex-col items-end gap-2 text-xs rounded-2xl px-4 py-3 border ${
                  darkMode
                    ? "bg-black/20 border-white/20 text-gray-200"
                    : "bg-white/10 border-white/60 text-white"
                }`}
              >
                <span className="font-bold uppercase tracking-widest text-[10px]">
                  Resumen rápido
                </span>
                <span>
                  Plan:{" "}
                  <span className="font-black">
                    {PLANES[formData.plan].nombre}
                  </span>
                </span>
                <span>
                  Estado:{" "}
                  <span className="font-black uppercase">
                    {formData.estado}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div
            className={`rounded-2xl p-6 shadow-2xl mb-8 border ${
              darkMode
                ? "bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-500/20"
                : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <AlertCircle
                className={`w-6 h-6 flex-shrink-0 ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              />
              <div>
                <h3
                  className={`text-lg font-black mb-1 ${
                    darkMode ? "text-white" : "text-red-900"
                  }`}
                >
                  ¡Error!
                </h3>
                <p
                  className={`font-medium ${
                    darkMode ? "text-red-300" : "text-red-600"
                  }`}
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div
            className={`rounded-2xl p-6 shadow-2xl mb-8 border ${
              darkMode
                ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/20"
                : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <CheckCircle
                className={`w-6 h-6 flex-shrink-0 ${
                  darkMode ? "text-green-400" : "text-green-600"
                }`}
              />
              <div>
                <h3
                  className={`text-lg font-black mb-1 ${
                    darkMode ? "text-white" : "text-green-900"
                  }`}
                >
                  ¡Éxito!
                </h3>
                <p
                  className={`font-medium ${
                    darkMode ? "text-green-300" : "text-green-600"
                  }`}
                >
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div
          className={`rounded-2xl shadow-xl border overflow-hidden mb-8 ${
            darkMode
              ? "bg-gray-800/50 backdrop-blur-xl border-gray-700"
              : "bg-white/80 backdrop-blur-xl border-white/50"
          }`}
        >
          <div className="flex flex-wrap">
            {[
              { id: "basico", label: "Información Básica", icon: FileText },
              { id: "ubicacion", label: "Ubicación", icon: MapPin },
              { id: "config", label: "Configuración", icon: Settings },
              { id: "plan", label: "Plan", icon: Crown },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 font-bold flex items-center justify-center gap-2 transition-all duration-300 border-b-4 ${
                    isActive
                      ? darkMode
                        ? "bg-indigo-900/50 border-indigo-500 text-indigo-300"
                        : "bg-indigo-50 border-indigo-600 text-indigo-600"
                      : darkMode
                      ? "border-gray-700 text-gray-400 hover:text-gray-300"
                      : "border-gray-200 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB: INFORMACIÓN BÁSICA */}
          {activeTab === "basico" && (
            <CardSection
              icon={<FileText className="w-6 h-6" />}
              title="Información Básica"
              gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
              darkMode={darkMode}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nombre del Centro"
                  name="nombre"
                  icon={<Building2 className="w-5 h-5" />}
                  placeholder="Ingrese el nombre del centro"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Razón Social"
                  name="razon_social"
                  icon={<FileText className="w-5 h-5" />}
                  placeholder="Ingrese la razón social"
                  required
                  value={formData.razon_social}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="RUT"
                  name="rut"
                  icon={<Shield className="w-5 h-5" />}
                  placeholder="XX.XXX.XXX-X"
                  required
                  value={formData.rut}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Email de Contacto"
                  name="email_contacto"
                  type="email"
                  icon={<Mail className="w-5 h-5" />}
                  placeholder="contacto@centro.cl"
                  required
                  value={formData.email_contacto}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Teléfono Principal"
                  name="telefono_principal"
                  type="tel"
                  icon={<Phone className="w-5 h-5" />}
                  placeholder="+56 9 1234 5678"
                  required
                  value={formData.telefono_principal}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Teléfono Secundario"
                  name="telefono_secundario"
                  type="tel"
                  icon={<Phone className="w-5 h-5" />}
                  placeholder="+56 9 1234 5678"
                  value={formData.telefono_secundario}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Email Secundario"
                  name="email_secundario"
                  type="email"
                  icon={<Mail className="w-5 h-5" />}
                  placeholder="secundario@centro.cl"
                  value={formData.email_secundario}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Sitio Web"
                  name="sitio_web"
                  type="url"
                  icon={<Globe className="w-5 h-5" />}
                  placeholder="https://www.centro.cl"
                  value={formData.sitio_web}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="URL Logo (opcional)"
                  name="logo_url"
                  type="url"
                  icon={<Building2 className="w-5 h-5" />}
                  placeholder="https://...logo.png"
                  value={formData.logo_url}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                {formData.logo_url && (
                  <div className="flex flex-col items-start gap-2">
                    <span
                      className={`text-sm font-black uppercase tracking-wide ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Vista previa del logo
                    </span>
                    <div
                      className={`inline-flex items-center justify-center rounded-2xl border-2 p-3 ${
                        darkMode
                          ? "border-gray-700 bg-gray-900/40"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.logo_url}
                        alt="Logo centro"
                        className="w-16 h-16 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-6">
                <div className="group">
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-medium resize-none border-2 ${
                      darkMode
                        ? "bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    }`}
                    placeholder="Describe brevemente el centro médico..."
                  />
                </div>

                <div
                  className={`rounded-2xl p-4 border text-xs md:text-sm space-y-2 ${
                    darkMode
                      ? "bg-gray-900/40 border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="font-black uppercase tracking-widest text-[11px]">
                      Resumen de información básica
                    </span>
                  </div>
                  <p>
                    <span className="font-bold">Nombre:</span>{" "}
                    {formData.nombre || "—"}
                  </p>
                  <p>
                    <span className="font-bold">Razón social:</span>{" "}
                    {formData.razon_social || "—"}
                  </p>
                  <p>
                    <span className="font-bold">RUT:</span>{" "}
                    {formData.rut || "—"}
                  </p>
                  <p>
                    <span className="font-bold">Email:</span>{" "}
                    {formData.email_contacto || "—"}
                  </p>
                  <p>
                    <span className="font-bold">Teléfono:</span>{" "}
                    {formData.telefono_principal || "—"}
                  </p>
                </div>
              </div>
            </CardSection>
          )}

          {/* TAB: UBICACIÓN */}
          {activeTab === "ubicacion" && (
            <CardSection
              icon={<MapPin className="w-6 h-6" />}
              title="Ubicación"
              gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
              darkMode={darkMode}
            >
              <div className="space-y-6">
                <InputField
                  label="Dirección"
                  name="direccion"
                  icon={<MapPin className="w-5 h-5" />}
                  placeholder="Calle Principal #123"
                  required
                  value={formData.direccion}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Ciudad"
                  name="ciudad"
                  icon={<MapPin className="w-5 h-5" />}
                  placeholder="Santiago"
                  required
                  value={formData.ciudad}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SelectField
                    label="País"
                    name="id_pais"
                    icon={<Flag className="w-5 h-5" />}
                    disabled={loadingGeo}
                    value={formData.id_pais}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Seleccionar país" },
                      ...paises.map((p) => ({
                        value: p.id_pais,
                        label: p.nombre,
                      })),
                    ]}
                    required
                    darkMode={darkMode}
                  />

                  <SelectField
                    label="Región"
                    name="id_region"
                    icon={<MapPin className="w-5 h-5" />}
                    disabled={!formData.id_pais || regiones.length === 0}
                    value={formData.id_region}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Seleccionar región" },
                      ...regiones.map((r) => ({
                        value: r.id_region,
                        label: r.nombre,
                      })),
                    ]}
                    required
                    darkMode={darkMode}
                  />

                  <SelectField
                    label="Comuna"
                    name="id_comuna"
                    icon={<MapPin className="w-5 h-5" />}
                    disabled={!formData.id_region || comunas.length === 0}
                    value={formData.id_comuna}
                    onChange={handleChange}
                    options={[
                      { value: 0, label: "Seleccionar comuna" },
                      ...comunas.map((c) => ({
                        value: c.id_comuna,
                        label: c.nombre,
                      })),
                    ]}
                    darkMode={darkMode}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Código Postal"
                    name="codigo_postal"
                    icon={<MapPin className="w-5 h-5" />}
                    placeholder="7500000"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                    darkMode={darkMode}
                  />

                  <div className="group">
                    <label
                      className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Ubicación Seleccionada
                    </label>
                    <div
                      className={`w-full px-4 py-4 rounded-xl border-2 text-sm font-semibold ${
                        darkMode
                          ? "bg-gray-900/50 border-gray-700 text-gray-200"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      <p>
                        <span className="font-bold">País:</span>{" "}
                        {formData.pais || "—"}
                      </p>
                      <p>
                        <span className="font-bold">Región:</span>{" "}
                        {formData.region || "—"}
                      </p>
                      <p>
                        <span className="font-bold">Comuna:</span>{" "}
                        {formData.comuna || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardSection>
          )}

          {/* TAB: CONFIGURACIÓN */}
          {activeTab === "config" && (
            <CardSection
              icon={<Settings className="w-6 h-6" />}
              title="Configuración"
              gradient="bg-gradient-to-r from-purple-500 to-pink-500"
              darkMode={darkMode}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Horario Apertura"
                  name="horario_apertura"
                  type="time"
                  icon={<Clock className="w-5 h-5" />}
                  value={formData.horario_apertura}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Horario Cierre"
                  name="horario_cierre"
                  type="time"
                  icon={<Clock className="w-5 h-5" />}
                  value={formData.horario_cierre}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Días de Atención"
                  name="dias_atencion"
                  icon={<Calendar className="w-5 h-5" />}
                  placeholder="Ej: Lunes a Viernes"
                  value={formData.dias_atencion}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <InputField
                  label="Capacidad Pacientes/Día"
                  name="capacidad_pacientes_dia"
                  type="number"
                  icon={<Users className="w-5 h-5" />}
                  value={formData.capacidad_pacientes_dia}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <SelectField
                  label="Nivel de Complejidad"
                  name="nivel_complejidad"
                  icon={<TrendingUp className="w-5 h-5" />}
                  value={formData.nivel_complejidad}
                  onChange={handleChange}
                  options={[
                    { value: "baja", label: "🟢 Baja" },
                    { value: "media", label: "🟡 Media" },
                    { value: "alta", label: "🔴 Alta" },
                  ]}
                  darkMode={darkMode}
                />

                <SelectField
                  label="Tipo de Establecimiento"
                  name="tipo_establecimiento"
                  icon={<Building2 className="w-5 h-5" />}
                  value={formData.tipo_establecimiento}
                  onChange={handleChange}
                  options={[
                    { value: "hospital", label: "🏥 Hospital" },
                    { value: "clinica", label: "🏢 Clínica" },
                    { value: "consultorio", label: "🚪 Consultorio" },
                    { value: "laboratorio", label: "🧪 Laboratorio" },
                    { value: "centro_salud", label: "⚕️ Centro de Salud" },
                    { value: "otro", label: "📍 Otro" },
                  ]}
                  darkMode={darkMode}
                />

                <SelectField
                  label="Estado"
                  name="estado"
                  icon={<Shield className="w-5 h-5" />}
                  required
                  value={formData.estado}
                  onChange={handleChange}
                  options={[
                    { value: "activo", label: "✅ Activo" },
                    { value: "inactivo", label: "⛔ Inactivo" },
                    { value: "suspendido", label: "🔒 Suspendido" },
                  ]}
                  darkMode={darkMode}
                />

                <InputField
                  label="Fecha Inicio de Operación"
                  name="fecha_inicio_operacion"
                  type="date"
                  icon={<Calendar className="w-5 h-5" />}
                  value={formData.fecha_inicio_operacion}
                  onChange={handleChange}
                  darkMode={darkMode}
                />

                <div className="md:col-span-2">
                  <div className="group">
                    <label
                      className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Especialización Principal
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                          darkMode
                            ? "text-gray-500 group-focus-within:text-purple-400"
                            : "text-gray-400 group-focus-within:text-purple-600"
                        }`}
                      >
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        name="especializacion_principal"
                        value={formData.especializacion_principal}
                        onChange={handleChange}
                        placeholder="Ej: Medicina General, Pediatría, Cardiología..."
                        className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                          darkMode
                            ? "bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                            : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardSection>
          )}

          {/* TAB: PLAN */}
          {activeTab === "plan" && (
            <div className="space-y-6">
              <CardSection
                icon={<Crown className="w-6 h-6" />}
                title="Selecciona tu Plan"
                gradient="bg-gradient-to-r from-yellow-500 to-orange-500"
                darkMode={darkMode}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.values(PLANES).map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          plan: plan.id,
                        }))
                      }
                      className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                        formData.plan === plan.id
                          ? darkMode
                            ? "bg-indigo-900/50 border-indigo-500 shadow-2xl shadow-indigo-500/50"
                            : "bg-indigo-50 border-indigo-600 shadow-2xl shadow-indigo-300/50"
                          : darkMode
                          ? "bg-gray-900/30 border-gray-700 hover:border-gray-600"
                          : "bg-white/50 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${plan.bgColor}`}>
                          <div className={`${plan.color}`}>{plan.icon}</div>
                        </div>
                        {formData.plan === plan.id && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                      </div>

                      <h3
                        className={`text-xl font-black mb-1 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {plan.nombre}
                      </h3>
                      <p
                        className={`text-sm mb-4 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {plan.descripcion}
                      </p>

                      <p className={`text-2xl font-black mb-4 ${plan.color}`}>
                        {plan.precio}
                      </p>

                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className={`text-sm font-semibold flex items-center gap-2 ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardSection>
            </div>
          )}

          {/* Botones Premium - Sticky */}
          <div
            className={`sticky bottom-4 z-10 rounded-2xl shadow-2xl border p-4 md:p-6 mt-6 ${
              darkMode
                ? "bg-gray-800/80 backdrop-blur-xl border-gray-700"
                : "bg-white/80 backdrop-blur-xl border-white/50"
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
                <div
                  className={`flex items-center gap-2 ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  <Crown
                    className={`w-4 h-4 ${
                      darkMode ? "text-yellow-300" : "text-yellow-500"
                    }`}
                  />
                  <span>
                    Plan seleccionado:{" "}
                    <span
                      className={
                        darkMode
                          ? "text-indigo-300 font-bold"
                          : "text-indigo-600 font-bold"
                      }
                    >
                      {PLANES[formData.plan].nombre}
                    </span>
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  <Shield
                    className={`w-4 h-4 ${
                      darkMode ? "text-emerald-300" : "text-emerald-600"
                    }`}
                  />
                  <span>
                    Estado:{" "}
                    <span className="font-bold uppercase">
                      {formData.estado}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-black shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creando Centro...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                      Crear Centro
                      <CheckCircle className="w-6 h-6 group-hover:animate-pulse" />
                    </>
                  )}
                </button>

                <Link
                  href="/admin/centros"
                  className="group px-8 py-5 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  Cancelar
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Estilos adicionales */}
      <style jsx>{`
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.6);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.9);
        }
      `}</style>
    </div>
  );
}
