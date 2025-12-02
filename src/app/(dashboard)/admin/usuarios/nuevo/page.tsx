// frontend/src/app/(dashboard)/admin/usuarios/nuevo/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Shield,
  Camera,
  ArrowLeft,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Moon,
  Sun,
  UserPlus,
  Sparkles,
  Palette,
  Globe,
} from "lucide-react";

// ==============================
// 🌍 INTERFACES
// ==============================
interface Pais {
  id_pais: number;
  nombre: string;
  codigo_iso2: string;
  codigo_iso3: string;
  phone_code: string;
  bandera_url: string;
  prioridad: number;
  activo: number;
}

interface Region {
  id_region: number;
  id_pais: number;
  nombre: string;
  codigo: string;
  abreviatura: string;
  activo: number;
}

interface Comuna {
  id_comuna: number;
  id_region: number;
  nombre: string;
  codigo: string;
  activo: number;
}

interface Centro {
  id_centro: number;
  nombre: string;
  estado: string;
  ciudad: string;
  region: string;
}

interface Sucursal {
  id_sucursal: number;
  nombre: string;
  id_centro: number;
  estado: string;
}

interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
  nivel_jerarquia: number;
  estado: string;
  pais_aplicable: string;
}

// ==============================
// 🎨 TEMAS PREMIUM
// ==============================
const colorThemes = {
  aurora: {
    name: "Aurora Boreal",
    primary: "from-violet-600 via-purple-600 to-fuchsia-600",
    accent: "from-purple-400 to-pink-400",
    glow: "shadow-purple-500/50",
  },
  ocean: {
    name: "Océano Profundo",
    primary: "from-cyan-500 via-blue-600 to-indigo-700",
    accent: "from-cyan-400 to-blue-400",
    glow: "shadow-blue-500/50",
  },
  sunset: {
    name: "Atardecer Dorado",
    primary: "from-orange-500 via-red-500 to-pink-600",
    accent: "from-orange-400 to-red-400",
    glow: "shadow-orange-500/50",
  },
  forest: {
    name: "Bosque Esmeralda",
    primary: "from-emerald-500 via-green-600 to-teal-700",
    accent: "from-emerald-400 to-green-400",
    glow: "shadow-emerald-500/50",
  },
} as const;

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==============================
  // 🌗 THEME
  // ==============================
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof colorThemes>("aurora");
  const [mostrarThemeSelector, setMostrarThemeSelector] = useState(false);

  // ==============================
  // 🌍 CATÁLOGOS
  // ==============================
  const [paises, setPaises] = useState<Pais[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);

  // Filtrados
  const [regionesFiltradas, setRegionesFiltradas] = useState<Region[]>([]);
  const [comunasFiltradas, setComunasFiltradas] = useState<Comuna[]>([]);
  const [centrosFiltrados, setCentrosFiltrados] = useState<Centro[]>([]);
  const [sucursalesFiltradas, setSucursalesFiltradas] = useState<Sucursal[]>([]);
  const [rolesFiltrados, setRolesFiltrados] = useState<Rol[]>([]);

  // ==============================
  // 📋 FORMULARIO
  // ==============================
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    celular: "",
    id_pais: "",
    id_region: "",
    id_comuna: "",
    direccion: "",
    ciudad: "",
    id_centro_principal: "",
    id_sucursal_principal: "",
    roles: [] as number[],
    foto_perfil_url: "",
    requiere_cambio_password: true,
    autenticacion_doble_factor: false,
    enviar_email_bienvenida: true,
  });

  // ==============================
  // ✅ VALIDACIONES
  // ==============================
  const [validaciones, setValidaciones] = useState({
    username: { valido: false, mensaje: "" },
    password: { valido: false, mensaje: "" },
    confirmPassword: { valido: false, mensaje: "" },
    rut: { valido: false, mensaje: "" },
    email: { valido: false, mensaje: "" },
  });

  // ==============================
  // 🎨 CLASES DINÁMICAS
  // ==============================
  const theme = colorThemes[selectedTheme];
  const bgClass = darkMode
    ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-black"
    : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100";

  const cardBg = darkMode
    ? "bg-gradient-to-br from-slate-800/40 via-slate-900/40 to-slate-800/40 backdrop-blur-2xl border-white/5"
    : "bg-white/60 backdrop-blur-2xl border-white/20";

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-300" : "text-slate-600";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-white/10" : "border-slate-200/50";
  const inputBg = darkMode ? "bg-slate-900/50" : "bg-white/80";

  // ==============================
  // 🎛 THEME EFFECTS
  // ==============================
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedTheme =
      (localStorage.getItem("colorTheme") as keyof typeof colorThemes) ||
      "aurora";

    setDarkMode(savedDarkMode);
    if (savedTheme && colorThemes[savedTheme]) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const changeTheme = (theme: keyof typeof colorThemes) => {
    setSelectedTheme(theme);
    localStorage.setItem("colorTheme", theme);
    setMostrarThemeSelector(false);
  };

  // ==============================
  // 📡 CARGAR CATÁLOGOS - USANDO APIs GEO
  // ==============================
  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      console.log("🌍 Cargando catálogos desde APIs GEO...");

      // 1️⃣ Cargar países desde /api/geo/paises
      try {
        const resPaises = await fetch("/api/geo/paises");
        const dataPaises = await resPaises.json();
        if (dataPaises.success && Array.isArray(dataPaises.paises)) {
          const paisesActivos = dataPaises.paises.filter(
            (p: Pais) => p.activo === 1 && p.prioridad <= 100
          );
          setPaises(paisesActivos);
          console.log("✅ Países cargados:", paisesActivos.length);
        }
      } catch (error) {
        console.error("❌ Error al cargar países:", error);
      }

      // 2️⃣ Cargar centros
      try {
        const resCentros = await fetch("/api/centros/opciones");
        const dataCentros = await resCentros.json();
        if (dataCentros.success && Array.isArray(dataCentros.opciones.centros)) {
          setCentros(dataCentros.opciones.centros);
          console.log("✅ Centros cargados:", dataCentros.opciones.centros.length);
        }
      } catch (error) {
        console.error("❌ Error al cargar centros:", error);
      }

      // 3️⃣ Cargar sucursales
      try {
        const resSucursales = await fetch("/api/sucursales");
        const dataSucursales = await resSucursales.json();
        if (dataSucursales.success && Array.isArray(dataSucursales.data)) {
          setSucursales(dataSucursales.data);
          console.log("✅ Sucursales cargadas:", dataSucursales.data.length);
        }
      } catch (error) {
        console.error("❌ Error al cargar sucursales:", error);
      }

      // 4️⃣ Cargar roles
      try {
        const resRoles = await fetch("/api/roles");
        const dataRoles = await resRoles.json();
        if (dataRoles.success && Array.isArray(dataRoles.data)) {
          const rolesActivos = dataRoles.data.filter(
            (r: Rol) => r.estado === "activo"
          );
          setRoles(rolesActivos);
          console.log("✅ Roles cargados:", rolesActivos.length);
        }
      } catch (error) {
        console.error("❌ Error al cargar roles:", error);
      }
    } catch (error) {
      console.error("❌ Error general:", error);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // ==============================
  // 🌍 CARGAR REGIONES - USANDO /api/geo/regiones
  // ==============================
  const cargarRegiones = async (paisId: string) => {
  if (!paisId) {
    setRegionesFiltradas([]);
    setFormData((prev) => ({
      ...prev,
      id_region: "",
      id_comuna: "",
    }));
    return;
  }

  try {
    const resRegiones = await fetch(
      `/api/geo/regiones?id_pais=${paisId}&inactivos=false`,
      {
        method: "GET",
        credentials: "include", // 🔥 NECESARIO PARA SESIÓN
      }
    );

    // Si la sesión expiró
    if (resRegiones.status === 401) {
      console.error("❌ Sesión inválida o expirada al cargar regiones.");
      setRegionesFiltradas([]);
      return;
    }

    // Si la API regresó error o HTML
    if (!resRegiones.ok) {
      console.error("❌ Error HTTP al cargar regiones:", resRegiones.status);
      setRegionesFiltradas([]);
      return;
    }

    const dataRegiones = await resRegiones.json();

    if (dataRegiones.success && Array.isArray(dataRegiones.regiones)) {
      setRegionesFiltradas(dataRegiones.regiones);

      console.log(
        `✅ Regiones cargadas (${dataRegiones.regiones.length}) para país: ${paisId}`
      );
    } else {
      console.warn("⚠️ Respuesta inesperada:", dataRegiones);
      setRegionesFiltradas([]);
    }
  } catch (error) {
    console.error("❌ Error al cargar regiones:", error);
    setRegionesFiltradas([]);
  }
};


  // ==============================
  // 🏘️ CARGAR COMUNAS - USANDO /api/geo/comunas
  // ==============================
  const cargarComunas = async (regionId: string) => {
    if (!regionId) {
      setComunasFiltradas([]);
      setFormData((prev) => ({
        ...prev,
        id_comuna: "",
      }));
      return;
    }

    try {
      const resComunas = await fetch(
        `/api/geo/comunas?id_region=${regionId}&inactivos=false`
      );
      const dataComunas = await resComunas.json();
      if (dataComunas.success && Array.isArray(dataComunas.comunas)) {
        setComunasFiltradas(dataComunas.comunas);
        console.log("✅ Comunas cargadas:", dataComunas.comunas.length);
      }
    } catch (error) {
      console.error("❌ Error al cargar comunas:", error);
    }
  };

  // ==============================
  // 🏥 CARGAR CENTROS POR PAÍS
  // ==============================
  useEffect(() => {
    if (formData.id_pais) {
      const centrosFiltro = centros.filter(
        (c) => c.estado === "activo"
      );
      setCentrosFiltrados(centrosFiltro);
      setFormData((prev) => ({
        ...prev,
        id_centro_principal: "",
        id_sucursal_principal: "",
      }));
    }
  }, [formData.id_pais, centros]);

  // ==============================
  // 🏢 CARGAR SUCURSALES POR CENTRO
  // ==============================
  useEffect(() => {
    if (formData.id_centro_principal) {
      const sucursalesFiltro = sucursales.filter(
        (s) =>
          s.id_centro === parseInt(formData.id_centro_principal) &&
          s.estado === "activo"
      );
      setSucursalesFiltradas(sucursalesFiltro);
      setFormData((prev) => ({
        ...prev,
        id_sucursal_principal: "",
      }));
    }
  }, [formData.id_centro_principal, sucursales]);

  // ==============================
  // 🛡️ CARGAR ROLES POR PAÍS
  // ==============================
  useEffect(() => {
    if (formData.id_pais) {
      const rolesFiltro = roles.filter(
        (r) =>
          r.estado === "activo" &&
          (!r.pais_aplicable || r.pais_aplicable === formData.id_pais)
      );
      setRolesFiltrados(rolesFiltro);
      setFormData((prev) => ({
        ...prev,
        roles: [],
      }));
    }
  }, [formData.id_pais, roles]);

  // ==============================
  // 📝 HANDLE INPUT CHANGE
  // ==============================
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "id_pais") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      cargarRegiones(value);
    } else if (name === "id_region") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      cargarComunas(value);
    } else if (name === "rut") {
      const rutFormateado = formatearRUT(value);
      setFormData((prev) => ({ ...prev, [name]: rutFormateado }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ==============================
  // 🔐 VALIDACIONES
  // ==============================
  const validarRUT = (rut: string): boolean => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, "");
    if (rutLimpio.length < 2) return false;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();

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
  };

  const formatearRUT = (rut: string): string => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, "");
    if (rutLimpio.length <= 1) return rutLimpio;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${cuerpoFormateado}-${dv}`;
  };

  // Validar username
  useEffect(() => {
    if (formData.username) {
      if (formData.username.length < 4) {
        setValidaciones((prev) => ({
          ...prev,
          username: { valido: false, mensaje: "Mínimo 4 caracteres" },
        }));
      } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
        setValidaciones((prev) => ({
          ...prev,
          username: {
            valido: false,
            mensaje: "Solo letras, números, puntos, guiones",
          },
        }));
      } else {
        setValidaciones((prev) => ({
          ...prev,
          username: { valido: true, mensaje: "Username válido" },
        }));
      }
    }
  }, [formData.username]);

  // Validar password
  useEffect(() => {
    if (formData.password) {
      const requisitos: string[] = [];
      if (formData.password.length < 8) requisitos.push("mínimo 8 caracteres");
      if (!/[A-Z]/.test(formData.password)) requisitos.push("mayúscula");
      if (!/[a-z]/.test(formData.password)) requisitos.push("minúscula");
      if (!/[0-9]/.test(formData.password)) requisitos.push("número");
      if (!/[^A-Za-z0-9]/.test(formData.password)) requisitos.push("carácter especial");

      if (requisitos.length > 0) {
        setValidaciones((prev) => ({
          ...prev,
          password: { valido: false, mensaje: `Falta: ${requisitos.join(", ")}` },
        }));
      } else {
        setValidaciones((prev) => ({
          ...prev,
          password: { valido: true, mensaje: "Contraseña segura" },
        }));
      }
    }
  }, [formData.password]);

  // Validar confirmación password
  useEffect(() => {
    if (formData.confirmPassword) {
      if (formData.confirmPassword !== formData.password) {
        setValidaciones((prev) => ({
          ...prev,
          confirmPassword: {
            valido: false,
            mensaje: "Las contraseñas no coinciden",
          },
        }));
      } else {
        setValidaciones((prev) => ({
          ...prev,
          confirmPassword: { valido: true, mensaje: "Las contraseñas coinciden" },
        }));
      }
    }
  }, [formData.confirmPassword, formData.password]);

  // Validar RUT
  useEffect(() => {
    if (formData.rut) {
      if (validarRUT(formData.rut)) {
        setValidaciones((prev) => ({
          ...prev,
          rut: { valido: true, mensaje: "RUT válido" },
        }));
      } else {
        setValidaciones((prev) => ({
          ...prev,
          rut: { valido: false, mensaje: "RUT inválido" },
        }));
      }
    }
  }, [formData.rut]);

  // Validar email
  useEffect(() => {
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(formData.email)) {
        setValidaciones((prev) => ({
          ...prev,
          email: { valido: true, mensaje: "Email válido" },
        }));
      } else {
        setValidaciones((prev) => ({
          ...prev,
          email: { valido: false, mensaje: "Email inválido" },
        }));
      }
    }
  }, [formData.email]);

  // ==============================
  // 🎯 HANDLE SUBMIT
  // ==============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validaciones finales
      if (!validaciones.username.valido) {
        setError("Username no válido");
        setLoading(false);
        return;
      }

      if (!validaciones.password.valido) {
        setError("Contraseña no cumple requisitos");
        setLoading(false);
        return;
      }

      if (!validaciones.email.valido) {
        setError("Email no válido");
        setLoading(false);
        return;
      }

      if (!validaciones.rut.valido) {
        setError("RUT no válido");
        setLoading(false);
        return;
      }

      if (formData.roles.length === 0) {
        setError("Debe seleccionar al menos un rol");
        setLoading(false);
        return;
      }

      if (!formData.id_pais) {
        setError("Debe seleccionar un país");
        setLoading(false);
        return;
      }

  const response = await fetch("/api/admin/usuarios/nuevo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // 🔥 NECESARIO
  body: JSON.stringify({
    ...formData,
    id_pais: parseInt(formData.id_pais),
    id_region: formData.id_region ? parseInt(formData.id_region) : null,
    id_comuna: formData.id_comuna ? parseInt(formData.id_comuna) : null,
    id_centro_principal: formData.id_centro_principal
      ? parseInt(formData.id_centro_principal)
      : null,
    id_sucursal_principal: formData.id_sucursal_principal
      ? parseInt(formData.id_sucursal_principal)
      : null,
  }),
});

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/usuarios");
        }, 2000);
      } else {
        setError(data.error || "Error al crear usuario");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleRolToggle = (idRol: number) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(idRol)
        ? prev.roles.filter((r) => r !== idRol)
        : [...prev.roles, idRol];
      return { ...prev, roles };
    });
  };

  const getValidationIcon = (validacion: {
    valido: boolean;
    mensaje: string;
  }) => {
    if (!validacion.mensaje) return null;
    return validacion.valido ? (
      <CheckCircle className="w-5 h-5 text-emerald-400" />
    ) : (
      <AlertCircle className="w-5 h-5 text-rose-400" />
    );
  };

  // ==============================
  // ⏳ LOADING
  // ==============================
  if (loadingCatalogos) {
    return (
      <div
        className={`min-h-screen ${bgClass} flex items-center justify-center transition-all duration-500 relative overflow-hidden`}
      >
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${theme.primary} opacity-5 blur-3xl animate-pulse`}
          ></div>
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h3 className={`text-2xl font-black ${textPrimary} mb-2`}>
            <Sparkles className="w-6 h-6 inline animate-pulse mr-2" />
            Cargando Formulario
          </h3>
          <p className={`${textSecondary} font-medium`}>
            Obteniendo datos de países, regiones y roles...
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // 🖼 RENDER PRINCIPAL
  // ==============================
  return (
    <div
      className={`min-h-screen ${bgClass} p-3 md:p-6 lg:p-8 transition-all duration-500 relative overflow-hidden`}
    >
      {/* Efecto de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${theme.primary} opacity-5 blur-3xl animate-pulse`}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* CONTROLES FLOTANTES */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
          <button
            onClick={() => setDarkMode((v) => !v)}
            className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110 group`}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setMostrarThemeSelector(!mostrarThemeSelector)}
              className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110`}
            >
              <Palette
                className={`w-5 h-5 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
              />
            </button>

            {mostrarThemeSelector && (
              <div
                className={`absolute top-full right-0 mt-3 ${cardBg} ${borderColor} border rounded-2xl shadow-2xl p-4 min-w-[250px] animate-in fade-in slide-in-from-top-2 duration-200`}
              >
                <div className="space-y-2">
                  {Object.entries(colorThemes).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() =>
                        changeTheme(key as keyof typeof colorThemes)
                      }
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        selectedTheme === key
                          ? `bg-gradient-to-r ${t.primary} text-white shadow-lg`
                          : `${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50/50"} ${textSecondary}`
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${t.primary} shadow-lg`}
                      ></div>
                      <span className="font-bold text-sm">{t.name}</span>
                      {selectedTheme === key && (
                        <CheckCircle className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* HEADER */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/usuarios")}
                className={`p-3 ${inputBg} ${borderColor} border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105`}
              >
                <ArrowLeft className={`w-5 h-5 ${textPrimary}`} />
              </button>

              <div className="relative group">
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                ></div>
                <div
                  className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-2 ${
                    darkMode ? "border-slate-700" : "border-white"
                  } shadow-xl`}
                >
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
              </div>

              <div>
                <h1 className={`text-3xl font-black ${textPrimary}`}>
                  Nuevo Usuario Global
                </h1>
                <p className={`${textSecondary} font-medium mt-1 flex items-center gap-2`}>
                  <Globe className="w-4 h-4" />
                  Plataforma Multi-País
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTAS */}
{error && (
  <div
    className={`${cardBg} rounded-2xl shadow-2xl border-2 p-4 flex items-start gap-3 animate-in shake transition-all duration-300 ${
      darkMode
        ? "border-rose-500/30 bg-rose-500/10"
        : "border-rose-200 bg-rose-50"
    }`}
  >
    <AlertCircle
      className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
        darkMode ? "text-rose-400" : "text-rose-600"
      }`}
    />

    <div className="flex-1">
      <h3
        className={`font-black text-lg ${
          darkMode ? "text-rose-400" : "text-rose-800"
        }`}
      >
        Error
      </h3>

      <p
        className={`text-sm mt-1 font-medium ${
          darkMode ? "text-rose-300" : "text-rose-600"
        }`}
      >
        {error}
      </p>
    </div>

    <button
      onClick={() => setError("")}
      className={`transition-colors duration-200 ${
        darkMode
          ? "text-rose-400 hover:text-rose-300"
          : "text-rose-400 hover:text-rose-600"
      }`}
    >
      <X className="w-5 h-5" />
    </button>
  </div>
)}

       {success && (
  <div
    className={`${cardBg} rounded-2xl shadow-2xl border-2 p-4 flex items-start gap-3 animate-in zoom-in transition-all duration-300 ${
      darkMode
        ? "border-emerald-500/30 bg-emerald-500/10"
        : "border-emerald-200 bg-emerald-50"
    }`}
  >
    <CheckCircle
      className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
        darkMode ? "text-emerald-400" : "text-emerald-600"
      }`}
    />

    <div className="flex-1">
      <h3
        className={`font-black text-lg ${
          darkMode ? "text-emerald-400" : "text-emerald-800"
        }`}
      >
        ¡Usuario creado exitosamente!
      </h3>

      <p
        className={`text-sm mt-1 font-medium ${
          darkMode ? "text-emerald-300" : "text-emerald-600"
        }`}
      >
        Redirigiendo...
      </p>
    </div>
  </div>
)}


        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DATOS DE ACCESO */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "100ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${theme.primary} opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                >
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Datos de Acceso
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Usuario *
                  </label>
                  <div className="relative group">
                    <User
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-12 pr-12 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                      placeholder="usuario123"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {getValidationIcon(validaciones.username)}
                    </div>
                  </div>
                  {validaciones.username.mensaje && (
                    <p
                      className={`text-sm mt-2 font-bold ${
                        validaciones.username.valido
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {validaciones.username.mensaje}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Email *
                  </label>
                  <div className="relative group">
                    <Mail
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-12 pr-12 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                      placeholder="usuario@ejemplo.com"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {getValidationIcon(validaciones.email)}
                    </div>
                  </div>
                  {validaciones.email.mensaje && (
                    <p
                      className={`text-sm mt-2 font-bold ${
                        validaciones.email.valido
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {validaciones.email.mensaje}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Contraseña *
                  </label>
                  <div className="relative group">
                    <Lock
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-12 pr-24 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                      placeholder="••••••••"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {getValidationIcon(validaciones.password)}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`transition-colors duration-200 ${
                          darkMode
                            ? "text-slate-400 hover:text-slate-300"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {validaciones.password.mensaje && (
                    <p
                      className={`text-sm mt-2 font-bold ${
                        validaciones.password.valido
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {validaciones.password.mensaje}
                    </p>
                  )}
                </div>

                {/* Confirmar Password */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Confirmar Contraseña *
                  </label>
                  <div className="relative group">
                    <Lock
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-12 pr-24 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                      placeholder="••••••••"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {getValidationIcon(validaciones.confirmPassword)}
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={`transition-colors duration-200 ${
                          darkMode
                            ? "text-slate-400 hover:text-slate-300"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {validaciones.confirmPassword.mensaje && (
                    <p
                      className={`text-sm mt-2 font-bold ${
                        validaciones.confirmPassword.valido
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {validaciones.confirmPassword.mensaje}
                    </p>
                  )}
                </div>
              </div>

              {/* Opciones de Seguridad */}
              <div
                className={`mt-6 pt-6 border-t transition-colors duration-300 space-y-3 ${
                  darkMode ? "border-white/10" : "border-slate-200"
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="requiere_cambio_password"
                    checked={formData.requiere_cambio_password}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-2 rounded focus:ring-2 focus:ring-blue-500 transition-all accent-blue-600"
                  />
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      darkMode
                        ? "text-slate-300 group-hover:text-white"
                        : "text-slate-700 group-hover:text-slate-900"
                    }`}
                  >
                    Requerir cambio de contraseña en primer acceso
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="autenticacion_doble_factor"
                    checked={formData.autenticacion_doble_factor}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-2 rounded focus:ring-2 focus:ring-blue-500 transition-all accent-blue-600"
                  />
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      darkMode
                        ? "text-slate-300 group-hover:text-white"
                        : "text-slate-700 group-hover:text-slate-900"
                    }`}
                  >
                    Habilitar autenticación de doble factor (2FA)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="enviar_email_bienvenida"
                    checked={formData.enviar_email_bienvenida}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-2 rounded focus:ring-2 focus:ring-blue-500 transition-all accent-blue-600"
                  />
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      darkMode
                        ? "text-slate-300 group-hover:text-white"
                        : "text-slate-700 group-hover:text-slate-900"
                    }`}
                  >
                    Enviar email de bienvenida
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* DATOS PERSONALES */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "200ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Datos Personales
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* RUT */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    RUT / Documento *
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 pr-12 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                      placeholder="12.345.678-9"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {getValidationIcon(validaciones.rut)}
                    </div>
                  </div>
                  {validaciones.rut.mensaje && (
                    <p
                      className={`text-sm mt-2 font-bold ${
                        validaciones.rut.valido
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {validaciones.rut.mensaje}
                    </p>
                  )}
                </div>

                {/* Nombre */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                    placeholder="Juan"
                  />
                </div>

                {/* Apellido Paterno */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                    placeholder="Pérez"
                  />
                </div>

                {/* Apellido Materno */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                    placeholder="González"
                  />
                </div>

                {/* Fecha Nacimiento */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Fecha de Nacimiento
                  </label>
                  <div className="relative group">
                    <Calendar
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                    />
                  </div>
                </div>

                {/* Género */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="no_binario">No binario</option>
                    <option value="prefiero_no_decir">Prefiero no decir</option>
                  </select>
                </div>

                {/* Teléfono */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Teléfono
                  </label>
                  <div className="relative group">
                    <Phone
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                      placeholder="+56 2 2345 6789"
                    />
                  </div>
                </div>

                {/* Celular */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Celular
                  </label>
                  <div className="relative group">
                    <Phone
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="tel"
                      name="celular"
                      value={formData.celular}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                      placeholder="+56 9 8765 4321"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* UBICACIÓN GEOGRÁFICA - USANDO APIs GEO */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "300ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-700 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Ubicación Geográfica Multi-País
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* País */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    País *
                  </label>
                  <select
                    name="id_pais"
                    value={formData.id_pais}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  >
                    <option value="">🌍 Seleccionar país...</option>
                    {paises.map((pais) => (
                      <option key={pais.id_pais} value={pais.id_pais}>
                        {pais.bandera_url && "🚩"} {pais.nombre} ({pais.codigo_iso2})
                      </option>
                    ))}
                  </select>
                  {paises.length === 0 && (
                    <p className="text-sm mt-2 font-bold text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No hay países disponibles
                    </p>
                  )}
                </div>

                {/* Región */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Región / Provincia
                  </label>
                  <select
                    name="id_region"
                    value={formData.id_region}
                    onChange={handleInputChange}
                    disabled={!formData.id_pais}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 disabled:bg-slate-900/30"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:bg-slate-100"
                    }`}
                  >
                    <option value="">📍 Seleccionar región...</option>
                    {regionesFiltradas.map((region) => (
                      <option key={region.id_region} value={region.id_region}>
                        {region.nombre} ({region.codigo})
                      </option>
                    ))}
                  </select>
                  {!formData.id_pais && (
                    <p className={`text-sm mt-2 font-medium ${textMuted}`}>
                      Primero seleccione un país
                    </p>
                  )}
                  {formData.id_pais && regionesFiltradas.length === 0 && (
                    <p className="text-sm mt-2 font-bold text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No hay regiones disponibles
                    </p>
                  )}
                </div>

                {/* Comuna */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Comuna / Municipio
                  </label>
                  <select
                    name="id_comuna"
                    value={formData.id_comuna}
                    onChange={handleInputChange}
                    disabled={!formData.id_region}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 disabled:bg-slate-900/30"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:bg-slate-100"
                    }`}
                  >
                    <option value="">🏘️ Seleccionar comuna...</option>
                    {comunasFiltradas.map((comuna) => (
                      <option key={comuna.id_comuna} value={comuna.id_comuna}>
                        {comuna.nombre}
                      </option>
                    ))}
                  </select>
                  {!formData.id_region && (
                    <p className={`text-sm mt-2 font-medium ${textMuted}`}>
                      Primero seleccione una región
                    </p>
                  )}
                  {formData.id_region && comunasFiltradas.length === 0 && (
                    <p className="text-sm mt-2 font-bold text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No hay comunas disponibles
                    </p>
                  )}
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Dirección
                  </label>
                  <div className="relative group">
                    <MapPin
                      className={`absolute left-4 top-3 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                      placeholder="Av. Principal 123, Depto 456"
                    />
                  </div>
                </div>

                {/* Ciudad */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                    placeholder="Santiago"
                  />
                </div>
              </div>

              {/* Info de ubicación */}
              <div
                className={`mt-6 p-4 rounded-xl border-2 ${
                  darkMode
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <p
                  className={`text-sm font-bold flex items-center gap-2 ${
                    darkMode ? "text-blue-300" : "text-blue-800"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Los datos de ubicación se sincronizarán automáticamente desde
                  las APIs geográficas
                </p>
              </div>
            </div>
          </div>

          {/* ASIGNACIÓN ORGANIZACIONAL */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "400ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Asignación Organizacional
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Centro Médico */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Centro Médico Principal
                  </label>
                  <select
                    name="id_centro_principal"
                    value={formData.id_centro_principal}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  >
                    <option value="">🏥 Seleccionar centro...</option>
                    {centrosFiltrados.map((centro) => (
                      <option key={centro.id_centro} value={centro.id_centro}>
                        {centro.nombre} - {centro.ciudad}
                      </option>
                    ))}
                  </select>
                  {centrosFiltrados.length === 0 && (
                    <p className="text-sm mt-2 font-bold text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No hay centros en este país
                    </p>
                  )}
                </div>

                {/* Sucursal */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Sucursal Principal
                  </label>
                  <select
                    name="id_sucursal_principal"
                    value={formData.id_sucursal_principal}
                    onChange={handleInputChange}
                    disabled={!formData.id_centro_principal}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 disabled:bg-slate-900/30"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:bg-slate-100"
                    }`}
                  >
                    <option value="">🏢 Seleccionar sucursal...</option>
                    {sucursalesFiltradas.map((sucursal) => (
                      <option
                        key={sucursal.id_sucursal}
                        value={sucursal.id_sucursal}
                      >
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                  {!formData.id_centro_principal && (
                    <p className={`text-sm mt-2 font-medium ${textMuted}`}>
                      Primero seleccione un centro
                    </p>
                  )}
                  {formData.id_centro_principal &&
                    sucursalesFiltradas.length === 0 && (
                      <p className="text-sm mt-2 font-bold text-amber-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        No hay sucursales para este centro
                      </p>
                    )}
                </div>
              </div>

              {/* Info organizacional */}
              <div
                className={`mt-6 p-4 rounded-xl border-2 ${
                  darkMode
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-purple-50 border-purple-200"
                }`}
              >
                <p
                  className={`text-sm font-bold flex items-center gap-2 ${
                    darkMode ? "text-purple-300" : "text-purple-800"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  El usuario tendrá acceso a todos los módulos del centro
                  seleccionado
                </p>
              </div>
            </div>
          </div>

          {/* ROLES Y PERMISOS */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "500ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-orange-500 to-rose-600 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-black ${textPrimary}`}>
                    Roles y Permisos
                  </h2>
                  <p className={`text-sm ${textMuted} mt-1`}>
                    Roles disponibles para {formData.id_pais ? "este país" : "el país seleccionado"} *
                  </p>
                </div>
              </div>

              {rolesFiltrados.length === 0 ? (
                <div
                  className={`text-center py-12 border-2 rounded-2xl ${
                    darkMode
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <Shield
                    className={`w-16 h-16 mx-auto mb-4 ${
                      darkMode ? "text-amber-400" : "text-amber-500"
                    }`}
                  />
                  <p
                    className={`font-black text-lg mb-2 ${
                      darkMode ? "text-amber-400" : "text-amber-800"
                    }`}
                  >
                    {!formData.id_pais
                      ? "Seleccione un país primero"
                      : "No hay roles disponibles"}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-amber-300" : "text-amber-600"
                    }`}
                  >
                    {!formData.id_pais
                      ? "Los roles se cargarán según el país seleccionado"
                      : "Debe crear roles en el sistema antes de crear usuarios"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Grid de Roles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {rolesFiltrados.map((rol) => (
                      <label
                        key={rol.id_rol}
                        className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                          formData.roles.includes(rol.id_rol)
                            ? darkMode
                              ? "border-blue-500/50 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                              : "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20"
                            : darkMode
                            ? "border-white/10 hover:border-white/20 hover:bg-white/5"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(rol.id_rol)}
                          onChange={() => handleRolToggle(rol.id_rol)}
                          className="w-5 h-5 text-blue-600 border-2 rounded focus:ring-2 focus:ring-blue-500 mt-0.5 transition-all accent-blue-600 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-black text-sm uppercase tracking-wider ${
                              formData.roles.includes(rol.id_rol)
                                ? "text-blue-600 dark:text-blue-400"
                                : textPrimary
                            }`}
                          >
                            {rol.nombre}
                          </div>
                          {rol.descripcion && (
                            <div
                              className={`text-sm mt-2 leading-relaxed ${textMuted}`}
                            >
                              {rol.descripcion}
                            </div>
                          )}
                          <div
                            className={`text-xs mt-3 font-bold px-2.5 py-1 rounded-full inline-block ${
                              darkMode
                                ? "bg-slate-700/50 text-slate-300"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            Nivel: {rol.nivel_jerarquia}
                          </div>
                        </div>

                        {/* Icono de selección */}
                        {formData.roles.includes(rol.id_rol) && (
                          <div className="flex-shrink-0 ml-2">
                            <div
                              className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center animate-in zoom-in duration-200`}
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Validación de roles */}
                  {formData.roles.length === 0 && (
                    <div
                      className={`p-4 border-2 rounded-xl ${
                        darkMode
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <p
                        className={`text-sm font-bold flex items-center gap-2 ${
                          darkMode ? "text-amber-300" : "text-amber-800"
                        }`}
                      >
                        <AlertCircle className="w-5 h-5" />
                        Debe seleccionar al menos un rol para el usuario
                      </p>
                    </div>
                  )}

                  {/* Resumen de roles */}
                  {formData.roles.length > 0 && (
                    <div
                      className={`mt-6 p-4 rounded-xl border-2 ${
                        darkMode
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      <p
                        className={`text-sm font-bold flex items-center gap-2 mb-3 ${
                          darkMode ? "text-emerald-300" : "text-emerald-800"
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Roles seleccionados: {formData.roles.length}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.roles.map((rolId) => {
                          const rol = rolesFiltrados.find(
                            (r) => r.id_rol === rolId
                          );
                          return (
                            <div
                              key={rolId}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                darkMode
                                  ? "bg-emerald-500/30 text-emerald-300"
                                  : "bg-emerald-200 text-emerald-800"
                              }`}
                            >
                              {rol?.nombre}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* FOTO DE PERFIL */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "600ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-black ${textPrimary}`}>
                    Foto de Perfil
                  </h2>
                  <p className={`text-sm ${textMuted} mt-1`}>
                    Opcional - Ingrese URL de imagen
                  </p>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-black mb-3 uppercase tracking-wider ${textMuted}`}
                >
                  URL de la Foto
                </label>
                <div className="relative group">
                  <input
                    type="url"
                    name="foto_perfil_url"
                    value={formData.foto_perfil_url}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>

                {formData.foto_perfil_url && (
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${textMuted} mb-2`}>
                        Vista previa:
                      </p>
                      <div
                        className={`w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-lg ${
                          darkMode
                            ? "border-white/10 bg-slate-800/50"
                            : "border-slate-200 bg-slate-100"
                        }`}
                      >
                        <img
                          src={formData.foto_perfil_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${textMuted}`}>
                        La imagen se mostrará en el perfil del usuario en todos
                        los centros
                      </p>
                    </div>
                  </div>
                )}

                <p className={`text-sm mt-4 ${textMuted} flex items-start gap-2`}>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Ingrese una URL válida (JPG, PNG, GIF, WebP)
                </p>
              </div>
            </div>
          </div>

          {/* RESUMEN FINAL */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "700ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <h2 className={`text-2xl font-black ${textPrimary} mb-6`}>
                📋 Resumen de Datos
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Usuario */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p className={`text-xs font-black uppercase ${textMuted} mb-1`}>
                    Usuario
                  </p>
                  <p className={`text-lg font-black ${textPrimary} truncate`}>
                    {formData.username || "No especificado"}
                  </p>
                </div>

                {/* Email */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p className={`text-xs font-black uppercase ${textMuted} mb-1`}>
                    Email
                  </p>
                  <p className={`text-lg font-black ${textPrimary} truncate`}>
                    {formData.email || "No especificado"}
                  </p>
                </div>

                {/* Nombre Completo */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p className={`text-xs font-black uppercase ${textMuted} mb-1`}>
                    Nombre Completo
                  </p>
                  <p className={`text-lg font-black ${textPrimary}`}>
                    {`${formData.nombre} ${formData.apellido_paterno}`.trim() ||
                      "No especificado"}
                  </p>
                </div>

                {/* País */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p className={`text-xs font-black uppercase ${textMuted} mb-1`}>
                    País
                  </p>
                  <p className={`text-lg font-black ${textPrimary}`}>
                    {paises.find((p) => p.id_pais === parseInt(formData.id_pais))
                      ?.nombre || "No especificado"}
                  </p>
                </div>

                {/* Centro */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p className={`text-xs font-black uppercase ${textMuted} mb-1`}>
                    Centro
                  </p>
                  <p className={`text-lg font-black ${textPrimary} truncate`}>
                    {centrosFiltrados.find(
                      (c) => c.id_centro === parseInt(formData.id_centro_principal)
                    )?.nombre || "No especificado"}
                  </p>
                </div>

                {/* Roles */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p className={`text-xs font-black uppercase ${textMuted} mb-1`}>
                    Roles Asignados
                  </p>
                  <p className={`text-lg font-black ${textPrimary}`}>
                    {formData.roles.length > 0
                      ? `${formData.roles.length} rol(es)`
                      : "Ninguno"}
                  </p>
                </div>
              </div>

              {/* Indicadores de Validación */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    validaciones.username.valido
                      ? darkMode
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-emerald-50 border border-emerald-200"
                      : darkMode
                      ? "bg-rose-500/10 border border-rose-500/30"
                      : "bg-rose-50 border border-rose-200"
                  }`}
                >
                  {validaciones.username.valido ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      validaciones.username.valido
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    Usuario: {validaciones.username.valido ? "✓ Válido" : "✗ Inválido"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    validaciones.email.valido
                      ? darkMode
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-emerald-50 border border-emerald-200"
                      : darkMode
                      ? "bg-rose-500/10 border border-rose-500/30"
                      : "bg-rose-50 border border-rose-200"
                  }`}
                >
                  {validaciones.email.valido ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      validaciones.email.valido
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    Email: {validaciones.email.valido ? "✓ Válido" : "✗ Inválido"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    validaciones.password.valido
                      ? darkMode
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-emerald-50 border border-emerald-200"
                      : darkMode
                      ? "bg-rose-500/10 border border-rose-500/30"
                      : "bg-rose-50 border border-rose-200"
                  }`}
                >
                  {validaciones.password.valido ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      validaciones.password.valido
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    Contraseña: {validaciones.password.valido ? "✓ Segura" : "✗ Débil"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    formData.roles.length > 0
                      ? darkMode
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-emerald-50 border border-emerald-200"
                      : darkMode
                      ? "bg-rose-500/10 border border-rose-500/30"
                      : "bg-rose-50 border border-rose-200"
                  }`}
                >
                  {formData.roles.length > 0 ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      formData.roles.length > 0
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    Roles: {formData.roles.length > 0 ? "✓ Asignados" : "✗ Requerido"}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-6">
                <p className={`text-sm font-bold mb-2 ${textMuted}`}>
                  Progreso del formulario
                </p>
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    darkMode ? "bg-slate-700/50" : "bg-slate-200/50"
                  }`}
                >
                  <div
                    className={`h-full bg-gradient-to-r ${theme.primary} transition-all duration-500`}
                    style={{
                      width: `${
                        (Object.values(validaciones).filter((v) => v.valido)
                          .length /
                          Object.values(validaciones).length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div
            className="flex flex-col sm:flex-row gap-4 sticky bottom-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "800ms" }}
          >
            {/* Botón Cancelar */}
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl transform hover:-translate-y-1 ${
                darkMode
                  ? "bg-slate-800/80 border-2 border-white/10 text-slate-300 hover:bg-slate-800 hover:border-white/20"
                  : "bg-white/80 border-2 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </div>
            </button>

            {/* Botón Crear Usuario */}
            <button
              type="submit"
              disabled={
                loading ||
                success ||
                rolesFiltrados.length === 0 ||
                formData.roles.length === 0 ||
                !validaciones.username.valido ||
                !validaciones.email.valido ||
                !validaciones.password.valido ||
                !formData.id_pais
              }
              className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl transform hover:-translate-y-1 ${
                darkMode
                  ? `bg-gradient-to-r ${theme.primary} text-white hover:shadow-2xl ${theme.glow}`
                  : `bg-gradient-to-r ${theme.primary} text-white hover:shadow-2xl ${theme.glow}`
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creando usuario...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Crear Usuario Global</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Espaciador */}
          <div className="h-4"></div>
        </form>
      </div>
    </div>
  );
}
