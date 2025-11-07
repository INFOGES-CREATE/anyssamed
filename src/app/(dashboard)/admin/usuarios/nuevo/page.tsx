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
} from "lucide-react";

interface Centro {
  id_centro: number;
  nombre: string;
  estado: string;
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
}

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Estados para catálogos
  const [centros, setCentros] = useState<Centro[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [sucursalesFiltradas, setSucursalesFiltradas] = useState<Sucursal[]>([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    celular: "",
    fecha_nacimiento: "",
    genero: "",
    direccion: "",
    ciudad: "",
    region: "",
    id_centro_principal: "",
    id_sucursal_principal: "",
    roles: [] as number[],
    foto_perfil_url: "",
    requiere_cambio_password: true,
    autenticacion_doble_factor: false,
    enviar_email_bienvenida: true,
  });

  // Validaciones en tiempo real
  const [validaciones, setValidaciones] = useState({
    username: { valido: false, mensaje: "" },
    password: { valido: false, mensaje: "" },
    confirmPassword: { valido: false, mensaje: "" },
    rut: { valido: false, mensaje: "" },
    email: { valido: false, mensaje: "" },
  });

  // Detectar preferencia de tema del sistema al cargar
  useEffect(() => {
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(darkModePreference);
    }
  }, []);

  // Actualizar tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Cargar catálogos al montar
  useEffect(() => {
    cargarCatalogos();
  }, []);

  // Filtrar sucursales cuando cambia el centro
  useEffect(() => {
    if (formData.id_centro_principal) {
      const filtered = sucursales.filter(
        (s) => s.id_centro === parseInt(formData.id_centro_principal)
      );
      setSucursalesFiltradas(filtered);
      
      // Limpiar sucursal si no pertenece al centro seleccionado
      if (formData.id_sucursal_principal) {
        const sucursalValida = filtered.find(
          (s) => s.id_sucursal === parseInt(formData.id_sucursal_principal)
        );
        if (!sucursalValida) {
          setFormData((prev) => ({ ...prev, id_sucursal_principal: "" }));
        }
      }
    } else {
      setSucursalesFiltradas([]);
      setFormData((prev) => ({ ...prev, id_sucursal_principal: "" }));
    }
  }, [formData.id_centro_principal, sucursales]);

  // Validar username en tiempo real
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
            mensaje: "Solo letras, números, puntos, guiones y guiones bajos",
          },
        }));
      } else {
        setValidaciones((prev) => ({
          ...prev,
          username: { valido: true, mensaje: "Username válido" },
        }));
      }
    } else {
      setValidaciones((prev) => ({
        ...prev,
        username: { valido: false, mensaje: "" },
      }));
    }
  }, [formData.username]);

  // Validar password en tiempo real
  useEffect(() => {
    if (formData.password) {
      const requisitos: string[] = [];
      
      if (formData.password.length < 8) requisitos.push("mínimo 8 caracteres");
      if (!/[A-Z]/.test(formData.password)) requisitos.push("una mayúscula");
      if (!/[a-z]/.test(formData.password)) requisitos.push("una minúscula");
      if (!/[0-9]/.test(formData.password)) requisitos.push("un número");
      if (!/[^A-Za-z0-9]/.test(formData.password))
        requisitos.push("un carácter especial");

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
    } else {
      setValidaciones((prev) => ({
        ...prev,
        password: { valido: false, mensaje: "" },
      }));
    }
  }, [formData.password]);

  // Validar confirmación de password
  useEffect(() => {
    if (formData.confirmPassword) {
      if (formData.confirmPassword !== formData.password) {
        setValidaciones((prev) => ({
          ...prev,
          confirmPassword: { valido: false, mensaje: "Las contraseñas no coinciden" },
        }));
      } else {
        setValidaciones((prev) => ({
          ...prev,
          confirmPassword: { valido: true, mensaje: "Las contraseñas coinciden" },
        }));
      }
    } else {
      setValidaciones((prev) => ({
        ...prev,
        confirmPassword: { valido: false, mensaje: "" },
      }));
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
    } else {
      setValidaciones((prev) => ({
        ...prev,
        rut: { valido: false, mensaje: "" },
      }));
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
    } else {
      setValidaciones((prev) => ({
        ...prev,
        email: { valido: false, mensaje: "" },
      }));
    }
  }, [formData.email]);

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      console.log("🔄 Cargando catálogos...");

      // Cargar centros
      try {
        const resCentros = await fetch("/api/admin/centros");
        const dataCentros = await resCentros.json();
        console.log("📍 Centros recibidos:", dataCentros);
        
        if (dataCentros.success && Array.isArray(dataCentros.data)) {
          const centrosActivos = dataCentros.data.filter(
            (c: Centro) => c.estado === "activo"
          );
          setCentros(centrosActivos);
          console.log("✅ Centros activos cargados:", centrosActivos.length);
        } else {
          console.warn("⚠️ No se pudieron cargar centros");
        }
      } catch (error) {
        console.error("❌ Error al cargar centros:", error);
      }

      // Cargar sucursales
      try {
        const resSucursales = await fetch("/api/admin/sucursales");
        const dataSucursales = await resSucursales.json();
        console.log("🏢 Sucursales recibidas:", dataSucursales);
        
        if (dataSucursales.success && Array.isArray(dataSucursales.data)) {
          setSucursales(dataSucursales.data);
          console.log("✅ Sucursales cargadas:", dataSucursales.data.length);
        } else {
          console.warn("⚠️ No se pudieron cargar sucursales");
        }
      } catch (error) {
        console.error("❌ Error al cargar sucursales:", error);
      }

      // Cargar roles
      try {
        const resRoles = await fetch("/api/admin/roles");
        const dataRoles = await resRoles.json();
        console.log("🛡️ Roles recibidos:", dataRoles);
        
        if (dataRoles.success && Array.isArray(dataRoles.data)) {
          const rolesActivos = dataRoles.data.filter(
            (r: Rol) => r.estado === "activo"
          );
          setRoles(rolesActivos);
          console.log("✅ Roles activos cargados:", rolesActivos.length);
        } else {
          console.warn("⚠️ No se pudieron cargar roles");
        }
      } catch (error) {
        console.error("❌ Error al cargar roles:", error);
      }
    } catch (error) {
      console.error("❌ Error general al cargar catálogos:", error);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const validarRUT = (rut: string): boolean => {
    // Limpiar RUT
    const rutLimpio = rut.replace(/[^0-9kK]/g, "");
    if (rutLimpio.length < 2) return false;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();

    // Calcular dígito verificador
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

    // Formatear cuerpo con puntos
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${cuerpoFormateado}-${dv}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "rut") {
      // Formatear RUT automáticamente
      const rutFormateado = formatearRUT(value);
      setFormData((prev) => ({ ...prev, [name]: rutFormateado }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("📤 Enviando datos del formulario:", formData);

      // Validaciones finales
      if (!validaciones.username.valido) {
        setError("El nombre de usuario no es válido");
        setLoading(false);
        return;
      }

      if (!validaciones.password.valido) {
        setError("La contraseña no cumple con los requisitos de seguridad");
        setLoading(false);
        return;
      }

      if (!validaciones.confirmPassword.valido) {
        setError("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      if (!validaciones.rut.valido) {
        setError("El RUT no es válido");
        setLoading(false);
        return;
      }

      if (!validaciones.email.valido) {
        setError("El email no es válido");
        setLoading(false);
        return;
      }

      if (formData.roles.length === 0) {
        setError("Debe seleccionar al menos un rol");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📥 Respuesta del servidor:", data);

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

  const getValidationIcon = (validacion: { valido: boolean; mensaje: string }) => {
    if (!validacion.mensaje) return null;
    return validacion.valido ? (
      <CheckCircle className={`w-5 h-5 ${darkMode ? "text-emerald-400" : "text-emerald-500"}`} />
    ) : (
      <AlertCircle className={`w-5 h-5 ${darkMode ? "text-rose-400" : "text-rose-500"}`} />
    );
  };

  // Mostrar loader mientras se cargan los catálogos
  if (loadingCatalogos) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      }`}>
        <div className="text-center">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <p className={`font-bold text-lg mb-2 transition-colors duration-300 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            Cargando formulario...
          </p>
          <p className={`text-sm transition-colors duration-300 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            Obteniendo centros, sucursales y roles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    } p-4 md:p-6 lg:p-8`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${
          darkMode
            ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
            : "bg-white/95 backdrop-blur-xl border-slate-200"
        } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  darkMode
                    ? "hover:bg-slate-700 text-slate-300"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-800"
                  }`}>
                    Nuevo Usuario
                  </h1>
                  <p className={`mt-1 transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    Complete los datos para crear un nuevo usuario
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                darkMode
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                  : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border border-indigo-200"
              }`}
              title={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className={`${
            darkMode
              ? "bg-rose-500/10 border-rose-500/30"
              : "bg-rose-50 border-rose-200"
          } border-2 rounded-2xl p-4 flex items-start gap-3 transition-all duration-300`}>
            <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
              darkMode ? "text-rose-400" : "text-rose-600"
            }`} />
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${
                darkMode ? "text-rose-400" : "text-rose-800"
              }`}>
                Error
              </h3>
              <p className={`text-sm mt-1 ${
                darkMode ? "text-rose-300" : "text-rose-600"
              }`}>
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
          <div className={`${
            darkMode
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-emerald-50 border-emerald-200"
          } border-2 rounded-2xl p-4 flex items-start gap-3 transition-all duration-300`}>
            <CheckCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
              darkMode ? "text-emerald-400" : "text-emerald-600"
            }`} />
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${
                darkMode ? "text-emerald-400" : "text-emerald-800"
              }`}>
                ¡Usuario creado!
              </h3>
              <p className={`text-sm mt-1 ${
                darkMode ? "text-emerald-300" : "text-emerald-600"
              }`}>
                Redirigiendo a la lista de usuarios...
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos de Acceso */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-800"
              }`}>
                Datos de Acceso
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Nombre de Usuario *
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-10 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="usuario123"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon(validaciones.username)}
                  </div>
                </div>
                {validaciones.username.mensaje && (
                  <p className={`text-sm mt-1 font-medium ${
                    validaciones.username.valido
                      ? darkMode ? "text-emerald-400" : "text-emerald-600"
                      : darkMode ? "text-rose-400" : "text-rose-600"
                  }`}>
                    {validaciones.username.mensaje}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Email *
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-10 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="usuario@ejemplo.com"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon(validaciones.email)}
                  </div>
                </div>
                {validaciones.email.mensaje && (
                  <p className={`text-sm mt-1 font-medium ${
                    validaciones.email.valido
                      ? darkMode ? "text-emerald-400" : "text-emerald-600"
                      : darkMode ? "text-rose-400" : "text-rose-600"
                  }`}>
                    {validaciones.email.mensaje}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-20 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
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
                  <p className={`text-sm mt-1 font-medium ${
                    validaciones.password.valido
                      ? darkMode ? "text-emerald-400" : "text-emerald-600"
                      : darkMode ? "text-rose-400" : "text-rose-600"
                  }`}>
                    {validaciones.password.mensaje}
                  </p>
                )}
              </div>

              {/* Confirmar Password */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-20 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {getValidationIcon(validaciones.confirmPassword)}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  <p className={`text-sm mt-1 font-medium ${
                    validaciones.confirmPassword.valido
                      ? darkMode ? "text-emerald-400" : "text-emerald-600"
                      : darkMode ? "text-rose-400" : "text-rose-600"
                  }`}>
                    {validaciones.confirmPassword.mensaje}
                  </p>
                )}
              </div>
            </div>

            {/* Opciones de Seguridad */}
            <div className={`mt-6 pt-6 border-t transition-colors duration-300 space-y-3 ${
              darkMode ? "border-slate-700" : "border-slate-200"
            }`}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="requiere_cambio_password"
                  checked={formData.requiere_cambio_password}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className={`text-sm font-semibold transition-colors duration-200 ${
                  darkMode
                    ? "text-slate-300 group-hover:text-white"
                    : "text-slate-700 group-hover:text-slate-900"
                }`}>
                  Requerir cambio de contraseña en el primer inicio de sesión
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="autenticacion_doble_factor"
                  checked={formData.autenticacion_doble_factor}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className={`text-sm font-semibold transition-colors duration-200 ${
                  darkMode
                    ? "text-slate-300 group-hover:text-white"
                    : "text-slate-700 group-hover:text-slate-900"
                }`}>
                  Habilitar autenticación de doble factor (2FA)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="enviar_email_bienvenida"
                  checked={formData.enviar_email_bienvenida}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className={`text-sm font-semibold transition-colors duration-200 ${
                  darkMode
                    ? "text-slate-300 group-hover:text-white"
                    : "text-slate-700 group-hover:text-slate-900"
                }`}>
                  Enviar email de bienvenida con credenciales
                </span>
              </label>
            </div>
          </div>

          {/* Datos Personales */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-800"
              }`}>
                Datos Personales
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* RUT */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  RUT *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-4 pr-10 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="12.345.678-9"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getValidationIcon(validaciones.rut)}
                  </div>
                </div>
                {validaciones.rut.mensaje && (
                  <p className={`text-sm mt-1 font-medium ${
                    validaciones.rut.valido
                      ? darkMode ? "text-emerald-400" : "text-emerald-600"
                      : darkMode ? "text-rose-400" : "text-rose-600"
                  }`}>
                    {validaciones.rut.mensaje}
                  </p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="Juan"
                />
              </div>

              {/* Apellido Paterno */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Apellido Paterno *
                </label>
                <input
                  type="text"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="Pérez"
                />
              </div>

              {/* Apellido Materno */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Apellido Materno
                </label>
                <input
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="González"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="+56 2 2345 6789"
                  />
                </div>
              </div>

              {/* Celular */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Celular
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="+56 9 8765 4321"
                  />
                </div>
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
              </div>

              {/* Género */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Género
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="no_binario">No binario</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-3 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="Av. Principal 123, Depto 456"
                  />
                </div>
              </div>

              {/* Ciudad */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="Santiago"
                />
              </div>

              {/* Región */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Región
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Región Metropolitana">Región Metropolitana</option>
                  <option value="Región de Valparaíso">Región de Valparaíso</option>
                  <option value="Región del Biobío">Región del Biobío</option>
                  <option value="Región de La Araucanía">Región de La Araucanía</option>
                  <option value="Región de Los Lagos">Región de Los Lagos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Asignación Organizacional */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-800"
              }`}>
                Asignación Organizacional
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Centro Médico */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Centro Médico Principal
                </label>
                <select
                  name="id_centro_principal"
                  value={formData.id_centro_principal}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                >
                  <option value="">Seleccionar centro...</option>
                  {centros.map((centro) => (
                    <option key={centro.id_centro} value={centro.id_centro}>
                      {centro.nombre}
                    </option>
                  ))}
                </select>
                {centros.length === 0 && (
                  <p className={`text-sm mt-1 font-medium ${
                    darkMode ? "text-amber-400" : "text-amber-600"
                  }`}>
                    ⚠️ No hay centros médicos disponibles
                  </p>
                )}
              </div>

              {/* Sucursal */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Sucursal Principal
                </label>
                <select
                  name="id_sucursal_principal"
                  value={formData.id_sucursal_principal}
                  onChange={handleInputChange}
                  disabled={!formData.id_centro_principal}
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-800"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                  }`}
                >
                  <option value="">Seleccionar sucursal...</option>
                  {sucursalesFiltradas.map((sucursal) => (
                    <option key={sucursal.id_sucursal} value={sucursal.id_sucursal}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
                {!formData.id_centro_principal && (
                  <p className={`text-sm mt-1 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Primero seleccione un centro médico
                  </p>
                )}
                {formData.id_centro_principal && sucursalesFiltradas.length === 0 && (
                  <p className={`text-sm mt-1 font-medium ${
                    darkMode ? "text-amber-400" : "text-amber-600"
                  }`}>
                    ⚠️ No hay sucursales para este centro
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Roles */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-800"
              }`}>
                Roles y Permisos *
              </h2>
            </div>

            {roles.length === 0 ? (
              <div className={`text-center py-8 border-2 rounded-2xl ${
                darkMode
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <Shield className={`w-12 h-12 mx-auto mb-3 ${
                  darkMode ? "text-amber-400" : "text-amber-500"
                }`} />
                <p className={`font-bold text-lg mb-2 ${
                  darkMode ? "text-amber-400" : "text-amber-800"
                }`}>
                  No hay roles disponibles
                </p>
                <p className={`text-sm ${
                  darkMode ? "text-amber-300" : "text-amber-600"
                }`}>
                  Debe crear roles en el sistema antes de crear usuarios
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((rol) => (
                  <label
                    key={rol.id_rol}
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      formData.roles.includes(rol.id_rol)
                        ? darkMode
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-blue-500 bg-blue-50"
                        : darkMode
                        ? "border-slate-700 hover:border-slate-600 hover:bg-slate-700/50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(rol.id_rol)}
                      onChange={() => handleRolToggle(rol.id_rol)}
                      className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5 transition-all"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${
                        darkMode ? "text-white" : "text-slate-800"
                      }`}>
                        {rol.nombre}
                      </div>
                      {rol.descripcion && (
                        <div className={`text-sm mt-1 ${
                          darkMode ? "text-slate-400" : "text-slate-600"
                        }`}>
                          {rol.descripcion}
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${
                        darkMode ? "text-slate-500" : "text-slate-500"
                      }`}>
                        Nivel: {rol.nivel_jerarquia}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {roles.length > 0 && formData.roles.length === 0 && (
              <div className={`mt-4 p-3 border rounded-xl ${
                darkMode
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <p className={`text-sm font-medium ${
                  darkMode ? "text-amber-300" : "text-amber-800"
                }`}>
                  ⚠️ Debe seleccionar al menos un rol para el usuario
                </p>
              </div>
            )}
          </div>

          {/* Foto de Perfil (Opcional) */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-800"
              }`}>
                Foto de Perfil (Opcional)
              </h2>
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}>
                URL de la foto
              </label>
              <input
                type="url"
                name="foto_perfil_url"
                value={formData.foto_perfil_url}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  darkMode
                    ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="https://ejemplo.com/foto.jpg"
              />
              <p className={`text-sm mt-2 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Ingrese la URL de la imagen de perfil del usuario
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 sticky bottom-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className={`flex-1 px-6 py-4 rounded-xl transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                darkMode
                  ? "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600"
                  : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success || roles.length === 0}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Creando usuario...</span>
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  <span>Crear Usuario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}