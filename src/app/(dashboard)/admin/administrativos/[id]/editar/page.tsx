// frontend/src/app/(dashboard)/admin/administrativos/[id]/editar/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  User,
  MapPin,
  Shield,
  Lock,
  CheckCircle,
  Building2,
  Loader2,
  Moon,
  Sun,
  Edit3,
  Phone,
  Mail,
  Calendar,
  Palette,
  CheckCircle as CheckCircleIcon,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Star,
  TrendingUp,
  Activity,
  Award,
  Target,
  Crown,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-react";

// ==============================
// 🔐 Tipos / interfaces
// ==============================
interface Usuario {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  rut: string;
  telefono?: string | null;
  celular?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  region?: string | null;
  id_centro_principal?: number | null;
  id_sucursal_principal?: number | null;
  requiere_cambio_password: number | boolean;
  autenticacion_doble_factor: number | boolean;
  estado: "activo" | "inactivo" | "bloqueado" | "pendiente_activacion";
  roles_ids?: string;
  foto_perfil_url?: string | null;
  nombre_completo?: string;
}

interface Centro {
  id_centro: number;
  nombre: string;
}

interface Sucursal {
  id_sucursal: number;
  id_centro: number;
  nombre: string;
}

interface RolCatalogo {
  id_rol: number;
  nombre: string;
  descripcion: string | null;
  nivel_jerarquia?: number;
  es_predefinido?: number;
  estado?: string;
}

// ==============================
// 🎨 Temas de color mejorados
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
  midnight: {
    name: "Medianoche Estelar",
    primary: "from-slate-600 via-slate-700 to-slate-900",
    accent: "from-slate-400 to-slate-500",
    glow: "shadow-slate-500/50",
  },
  royal: {
    name: "Real Dorado",
    primary: "from-amber-500 via-yellow-600 to-orange-600",
    accent: "from-amber-400 to-yellow-400",
    glow: "shadow-amber-500/50",
  },
} as const;

export default function EditarAdministrativoPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  // ==============================
  // 🧠 STATE PRINCIPAL
  // ==============================
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalesFiltradas, setSucursalesFiltradas] = useState<Sucursal[]>(
    []
  );
  const [rolesCatalog, setRolesCatalog] = useState<RolCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState<{
    [key: string]: string;
  }>({});

  const [banner, setBanner] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // ==============================
  // 🎨 NUEVO: Sistema de Tabs
  // ==============================
  const [activeTab, setActiveTab] = useState<
    "seguridad" | "personal" | "direccion" | "organizacion" | "roles"
  >("seguridad");

  // ==============================
  // 🌗 THEME / UI PREFS
  // ==============================
  const [darkMode, setDarkMode] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof colorThemes>("aurora");

  // ==============================
  // 📝 FORM DATA CONTROLADO
  // ==============================
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    rut: "",
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
    requiere_cambio_password: false,
    autenticacion_doble_factor: false,
    estado: "activo" as
      | "activo"
      | "inactivo"
      | "bloqueado"
      | "pendiente_activacion",
  });

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

  const toggleDarkMode = () => setDarkMode((v) => !v);

  const changeTheme = (theme: keyof typeof colorThemes) => {
    setSelectedTheme(theme);
    localStorage.setItem("colorTheme", theme);
    setShowThemeSelector(false);
  };

  // ==============================
  // 🎨 CLASES DINÁMICAS MEJORADAS
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
  const hoverBg = darkMode ? "hover:bg-white/5" : "hover:bg-slate-50/50";
  const inputBg = darkMode ? "bg-slate-900/50" : "bg-white";

  const setOk = (msg: string) => setBanner({ type: "success", msg });
  const setErr = (msg: string) => setBanner({ type: "error", msg });

  // ==============================
  // ⏲ HELPERS
  // ==============================
  const getDateOnly = (val?: string | null) => {
    if (!val) return "";
    if (val.includes("T")) return val.split("T")[0] || "";
    if (val.includes(" ")) return val.split(" ")[0] || "";
    return val;
  };

  // ==============================
  // 📊 NUEVO: Cálculo de progreso
  // ==============================
  const calcularProgreso = (): number => {
    const campos = [
      formData.username,
      formData.email,
      formData.nombre,
      formData.apellido_paterno,
      formData.rut,
      formData.telefono,
      formData.celular,
      formData.fecha_nacimiento,
      formData.genero,
      formData.direccion,
      formData.ciudad,
      formData.region,
      formData.id_centro_principal,
      formData.id_sucursal_principal,
      formData.roles.length > 0 ? "si" : "",
    ];

    const completados = campos.filter((c) => c && c.toString().trim()).length;
    return Math.round((completados / campos.length) * 100);
  };

  // ==============================
  // 📥 CARGA INICIAL DE DATOS
  // ==============================
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [usuarioRes, centrosRes, sucursalesRes, rolesRes] =
          await Promise.all([
            // seguimos usando el endpoint de usuarios, el administrativo es un tipo de usuario
            fetch(`/api/admin/usuarios/${params.id}`, { cache: "no-store" }),
            fetch("/api/admin/centros", { cache: "no-store" }),
            fetch("/api/admin/sucursales", { cache: "no-store" }),
            fetch(`/api/admin/usuarios/${params.id}/roles`, {
              cache: "no-store",
            }),
          ]);

        const usuarioJson = await usuarioRes.json();
        const centrosJson = await centrosRes.json();
        const sucursalesJson = await sucursalesRes.json();
        const rolesJson = await rolesRes.json();

        if (usuarioJson.success) {
          const usr: Usuario = usuarioJson.data;
          setUsuario(usr);

          const requiereCambioPwd = Boolean(usr.requiere_cambio_password ?? 0);
          const tiene2FA = Boolean(usr.autenticacion_doble_factor ?? 0);
          let rolesAsignados: number[] = [];

          if (usr.roles_ids) {
            rolesAsignados = usr.roles_ids
              .split(",")
              .map((r: string) => parseInt(r.trim(), 10))
              .filter((n) => !Number.isNaN(n));
          }

          setFormData((prev) => ({
            ...prev,
            username: usr.username || "",
            email: usr.email || "",
            nombre: usr.nombre || "",
            apellido_paterno: usr.apellido_paterno || "",
            apellido_materno: usr.apellido_materno || "",
            rut: usr.rut || "",
            telefono: usr.telefono || "",
            celular: usr.celular || "",
            fecha_nacimiento: getDateOnly(usr.fecha_nacimiento),
            genero: usr.genero || "",
            direccion: usr.direccion || "",
            ciudad: usr.ciudad || "",
            region: usr.region || "",
            id_centro_principal: usr.id_centro_principal
              ? String(usr.id_centro_principal)
              : "",
            id_sucursal_principal: usr.id_sucursal_principal
              ? String(usr.id_sucursal_principal)
              : "",
            roles: rolesAsignados,
            requiere_cambio_password: requiereCambioPwd,
            autenticacion_doble_factor: tiene2FA,
            estado: usr.estado || "activo",
          }));
        } else {
          setErr(usuarioJson.error || "Error al cargar administrativo");
        }

        if (centrosJson.success && Array.isArray(centrosJson.data)) {
          setCentros(centrosJson.data);
        } else {
          setCentros([]);
        }

        if (sucursalesJson.success && Array.isArray(sucursalesJson.data)) {
          setSucursales(sucursalesJson.data);
        } else {
          setSucursales([]);
        }

        if (
          rolesJson.success &&
          rolesJson.data &&
          Array.isArray(rolesJson.data.catalogo)
        ) {
          const catalogo: RolCatalogo[] = rolesJson.data.catalogo;
          setRolesCatalog(catalogo);

          const asignadosIds: number[] = Array.isArray(
            rolesJson.data.asignados_ids
          )
            ? rolesJson.data.asignados_ids
            : [];

          setFormData((prev) => ({
            ...prev,
            roles: asignadosIds,
          }));
        } else {
          setRolesCatalog([]);
        }
      } catch (err: any) {
        console.error(err);
        setErr("Error al cargar datos iniciales");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [params.id]);

  useEffect(() => {
    if (formData.id_centro_principal) {
      const idCentroInt = parseInt(formData.id_centro_principal, 10);
      const filtered = sucursales.filter((s) => s.id_centro === idCentroInt);
      setSucursalesFiltradas(filtered);

      if (
        formData.id_sucursal_principal &&
        !filtered.find(
          (s) => String(s.id_sucursal) === formData.id_sucursal_principal
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          id_sucursal_principal: "",
        }));
      }
    } else {
      setSucursalesFiltradas([]);
      if (formData.id_sucursal_principal) {
        setFormData((prev) => ({
          ...prev,
          id_sucursal_principal: "",
        }));
      }
    }
  }, [formData.id_centro_principal, sucursales]);

  // ==============================
  // ✅ VALIDACIONES
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

    let cuerpoFormateado = "";
    for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) cuerpoFormateado = "." + cuerpoFormateado;
      cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    }

    return `${cuerpoFormateado}-${dv}`;
  };

  const validarFormulario = (): boolean => {
    const errores: { [key: string]: string } = {};

    if (!formData.username.trim())
      errores.username = "El username es obligatorio";
    if (!formData.email.trim()) errores.email = "El email es obligatorio";
    if (!formData.nombre.trim()) errores.nombre = "El nombre es obligatorio";
    if (!formData.apellido_paterno.trim())
      errores.apellido_paterno = "El apellido paterno es obligatorio";
    if (!formData.rut.trim()) errores.rut = "El RUT es obligatorio";

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errores.email = "Email inválido";
    }

    if (formData.username && !/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      errores.username =
        "El username solo puede contener letras, números, puntos, guiones y guiones bajos";
    }

    if (formData.rut && !validarRUT(formData.rut)) {
      errores.rut = "RUT inválido";
    }

    if (!Array.isArray(formData.roles) || formData.roles.length === 0) {
      errores.roles = "Debe asignar al menos un rol";
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  // ==============================
  // ✏ HANDLERS DE FORM
  // ==============================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;

    if (type === "checkbox") {
      const checked = (target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));

      if (erroresValidacion[name]) {
        setErroresValidacion((prevErr) => ({
          ...prevErr,
          [name]: "",
        }));
      }
      return;
    }

    if (name === "rut") {
      const formatted = formatearRUT(value);
      setFormData((prev) => ({
        ...prev,
        rut: formatted,
      }));
      if (erroresValidacion.rut) {
        setErroresValidacion((prevErr) => ({
          ...prevErr,
          rut: "",
        }));
      }
      return;
    }

    if (name === "id_centro_principal") {
      setFormData((prev) => ({
        ...prev,
        id_centro_principal: value,
        id_sucursal_principal: "",
      }));

      if (erroresValidacion[name]) {
        setErroresValidacion((prevErr) => ({
          ...prevErr,
          [name]: "",
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (erroresValidacion[name]) {
      setErroresValidacion((prevErr) => ({
        ...prevErr,
        [name]: "",
      }));
    }
  };

  const handleRolChange = (idRol: number) => {
    const rolesActualizados = formData.roles.includes(idRol)
      ? formData.roles.filter((r) => r !== idRol)
      : [...formData.roles, idRol];

    setFormData((prev) => ({
      ...prev,
      roles: rolesActualizados,
    }));

    if (erroresValidacion.roles) {
      setErroresValidacion((prevErr) => ({
        ...prevErr,
        roles: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setErr("Por favor corrige los errores del formulario.");
      return;
    }

    try {
      setSaving(true);
      setBanner(null);

      const res = await fetch(`/api/admin/usuarios/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id_centro_principal: formData.id_centro_principal
            ? parseInt(formData.id_centro_principal, 10)
            : null,
          id_sucursal_principal: formData.id_sucursal_principal
            ? parseInt(formData.id_sucursal_principal, 10)
            : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOk("¡Administrativo actualizado correctamente!");
        setTimeout(() => {
          router.push(`/admin/administrativos/${params.id}`);
        }, 1500);
      } else {
        setErr(data.error || "Error al actualizar administrativo");
      }
    } catch (err: any) {
      console.error(err);
      setErr(err.message || "Error desconocido al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // 📑 CONFIGURACIÓN DE TABS
  // ==============================
  const tabs = [
    {
      id: "seguridad" as const,
      label: "Seguridad",
      icon: Lock,
      color: "text-rose-500",
    },
    {
      id: "personal" as const,
      label: "Personal",
      icon: User,
      color: "text-blue-500",
    },
    {
      id: "direccion" as const,
      label: "Dirección",
      icon: MapPin,
      color: "text-emerald-500",
    },
    {
      id: "organizacion" as const,
      label: "Organización",
      icon: Building2,
      color: "text-purple-500",
    },
    {
      id: "roles" as const,
      label: "Roles",
      icon: Shield,
      color: "text-amber-500",
    },
  ];

  // ==============================
  // ⏳ LOADING PREMIUM
  // ==============================
  if (loading) {
    return (
      <div
        className={`min-h-screen ${bgClass} flex items-center justify-center transition-all duration-500`}
      >
        <div className="text-center relative">
          {/* Efecto de resplandor */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-32 h-32 bg-gradient-to-r ${theme.primary} rounded-full blur-3xl opacity-20 animate-pulse`}
            ></div>
          </div>

          {/* Spinner premium */}
          <div className="relative">
            <div
              className={`w-20 h-20 border-4 ${borderColor} border-t-transparent rounded-full animate-spin mx-auto mb-6`}
            ></div>
            <div
              className={`absolute inset-0 w-20 h-20 border-4 border-transparent border-t-current rounded-full animate-spin mx-auto bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            ></div>
          </div>

          <div className="relative z-10">
            <h3
              className={`text-2xl font-black ${textPrimary} mb-2 flex items-center gap-2 justify-center`}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              Cargando Administrativo
            </h3>
            <p className={`${textSecondary} font-medium animate-pulse`}>
              Preparando experiencia premium...
            </p>
          </div>

          {/* Barras de skeleton */}
          <div className="mt-12 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full ${
                  darkMode ? "bg-white/5" : "bg-slate-200/50"
                } animate-pulse`}
                style={{
                  width: `${100 - i * 15}%`,
                  margin: "0 auto",
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // 🖼 RENDER PRINCIPAL PREMIUM
  // ==============================
  const progreso = calcularProgreso();

  return (
    <div
      className={`min-h-screen ${bgClass} p-3 md:p-6 transition-all duration-500 relative overflow-hidden`}
    >
      {/* Efecto de fondo animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${theme.primary} opacity-5 blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr ${theme.primary} opacity-5 blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* ========================== */}
        {/* CONTROLES FLOTANTES */}
        {/* ========================== */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
          {/* Dark / Light */}
          <button
            onClick={toggleDarkMode}
            className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110 group`}
            title={darkMode ? "Modo Claro" : "Modo Oscuro"}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 group-hover:rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Selector de tema */}
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110 group`}
              title="Cambiar Tema"
            >
              <Palette
                className={`w-5 h-5 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent group-hover:rotate-12 transition-transform duration-300`}
              />
            </button>

            {showThemeSelector && (
              <div
                className={`absolute top-full right-0 mt-3 ${cardBg} ${borderColor} border rounded-2xl shadow-2xl p-4 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className={`w-4 h-4 ${textPrimary}`} />
                  <p
                    className={`${textPrimary} font-black text-sm uppercase tracking-wider`}
                  >
                    Temas Premium
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(colorThemes).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => changeTheme(key as keyof typeof colorThemes)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                        selectedTheme === key
                          ? `bg-gradient-to-r ${t.primary} text-white shadow-lg scale-[1.02]`
                          : `${hoverBg} ${textSecondary} hover:scale-[1.01]`
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${t.primary} shadow-lg group-hover:scale-110 transition-transform`}
                      ></div>
                      <span className="font-bold text-sm">{t.name}</span>
                      {selectedTheme === key && (
                        <CheckCircleIcon className="w-5 h-5 ml-auto animate-in zoom-in duration-200" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================== */}
        {/* BANNER RESULTADO */}
        {/* ========================== */}
        {banner && (
          <div
            className={`rounded-2xl p-4 border-2 shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
              banner.type === "success"
                ? "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-300"
                : "bg-gradient-to-r from-rose-500/10 to-red-500/10 border-rose-500/50 text-rose-700 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {banner.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-bold">{banner.msg}</span>
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* HEADER PREMIUM */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          {/* Barra superior con gradiente */}
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Info administrativo */}
              <div className="flex items-center gap-6">
                <Link
                  href={`/admin/administrativos/${params.id}`}
                  className={`p-3 ${
                    darkMode ? "bg-slate-800/80" : "bg-white/80"
                  } ${borderColor} border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105`}
                >
                  <ArrowLeft
                    className={`w-5 h-5 ${textPrimary} group-hover:-translate-x-1 transition-transform duration-300`}
                  />
                </Link>

                {/* Avatar */}
                <div className="relative group">
                  {usuario?.foto_perfil_url ? (
                    <>
                      <div
                        className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                      ></div>
                      <img
                        src={usuario.foto_perfil_url}
                        alt={usuario.nombre_completo || ""}
                        className={`relative w-20 h-20 rounded-2xl object-cover border-2 ${
                          darkMode ? "border-slate-700" : "border-white"
                        } shadow-xl`}
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                      ></div>
                      <div
                        className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-2 ${
                          darkMode ? "border-slate-700" : "border-white"
                        } shadow-xl`}
                      >
                        <span className="text-2xl font-black text-white">
                          {usuario?.nombre?.charAt(0)}
                          {usuario?.apellido_paterno?.charAt(0)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Insignia "Admin" */}
                  <div
                    className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                      darkMode
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-amber-100 text-amber-700"
                    } border border-amber-400/60 shadow-lg`}
                  >
                    <Crown className="w-3 h-3" />
                    ADMIN
                  </div>
                </div>

                {/* Texto */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className={`text-3xl font-black ${textPrimary} flex items-center gap-2`}>
                      Editar Administrativo
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          darkMode
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        Perfil Clave
                      </span>
                    </h1>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        darkMode
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {formData.estado}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div
                      className={`flex items-center gap-2 ${textSecondary} font-medium`}
                    >
                      <User className="w-4 h-4" />
                      <span>
                        {usuario?.nombre} {usuario?.apellido_paterno}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${textSecondary} font-medium`}
                    >
                      <Mail className="w-4 h-4" />
                      <span>{usuario?.email}</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${textSecondary} font-medium`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>
                        {formData.roles?.length || 0} rol
                        {formData.roles?.length === 1 ? "" : "es"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones acción */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  form="editar-usuario-form"
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/admin/administrativos/${params.id}`}
                  className={`flex items-center gap-2 px-6 py-3 ${
                    darkMode ? "bg-slate-800/50" : "bg-slate-100"
                  } ${textPrimary} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold group hover:scale-105 border ${borderColor}`}
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Cancelar</span>
                </Link>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${textSecondary}`} />
                  <span
                    className={`text-sm font-bold ${textSecondary}`}
                  >
                    Completitud del perfil administrativo
                  </span>
                </div>
                <span className={`text-sm font-black ${textPrimary}`}>
                  {progreso}%
                </span>
              </div>
              <div
                className={`h-2 ${
                  darkMode ? "bg-slate-800" : "bg-slate-200"
                } rounded-full overflow-hidden`}
              >
                <div
                  className={`h-full bg-gradient-to-r ${theme.primary} rounded-full transition-all duration-500`}
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* SISTEMA DE TABS PREMIUM */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-2 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 group ${
                    isActive
                      ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg scale-105`
                      : `${hoverBg} ${textSecondary} hover:scale-102`
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : tab.color
                    } group-hover:scale-110 transition-transform duration-300`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================== */}
        {/* CONTENIDO DEL FORMULARIO */}
        {/* ========================== */}
        <form
          id="editar-usuario-form"
          onSubmit={handleSubmit}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: "200ms" }}
        >
          {/* TAB: SEGURIDAD */}
          {activeTab === "seguridad" && (
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 space-y-6 animate-in fade-in zoom-in duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
                >
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${textPrimary}`}>
                    Acceso y Seguridad
                  </h2>
                  <p className={`${textSecondary} font-medium`}>
                    Credenciales y políticas de seguridad del administrativo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <User className="w-4 h-4" />
                    Username
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                        erroresValidacion.username
                          ? "border-rose-500"
                          : darkMode
                          ? "border-white/10 focus:border-blue-500/50"
                          : "border-slate-200 focus:border-blue-500"
                      } ${textPrimary} placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-500/50`}
                    />
                    {erroresValidacion.username && (
                      <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {erroresValidacion.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                        erroresValidacion.email
                          ? "border-rose-500"
                          : darkMode
                          ? "border-white/10 focus:border-blue-500/50"
                          : "border-slate-200 focus:border-blue-500"
                      } ${textPrimary} placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-500/50`}
                    />
                    {erroresValidacion.email && (
                      <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {erroresValidacion.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Activity className="w-4 h-4" />
                    Estado del Administrativo
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="activo">✅ Activo</option>
                    <option value="inactivo">⏸️ Inactivo</option>
                    <option value="bloqueado">🔒 Bloqueado</option>
                    <option value="pendiente_activacion">
                      ⏳ Pendiente Activación
                    </option>
                  </select>
                </div>
              </div>

              {/* Switches de seguridad */}
              <div
                className={`mt-8 pt-8 border-t-2 ${borderColor} space-y-5`}
              >
                <h3
                  className={`text-xl font-black ${textPrimary} flex items-center gap-2 mb-4`}
                >
                  <ShieldCheck className="w-6 h-6" />
                  Políticas de Seguridad
                </h3>

                <label
                  className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 group ${
                    darkMode
                      ? "bg-slate-800/50 hover:bg-slate-800"
                      : "bg-slate-50 hover:bg-slate-100"
                  } border-2 ${
                    formData.requiere_cambio_password
                      ? `border-blue-500/50 ${theme.glow}`
                      : borderColor
                  }`}
                >
                  <input
                    type="checkbox"
                    name="requiere_cambio_password"
                    checked={formData.requiere_cambio_password}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-500" />
                      <p className={`font-black ${textPrimary}`}>
                        Requerir cambio de contraseña
                      </p>
                    </div>
                    <p className={`text-sm ${textSecondary} mt-1`}>
                      El administrativo deberá actualizar su clave en el próximo
                      inicio de sesión
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 group ${
                    darkMode
                      ? "bg-slate-800/50 hover:bg-slate-800"
                      : "bg-slate-50 hover:bg-slate-100"
                  } border-2 ${
                    formData.autenticacion_doble_factor
                      ? `border-emerald-500/50 shadow-emerald-500/20`
                      : borderColor
                  }`}
                >
                  <input
                    type="checkbox"
                    name="autenticacion_doble_factor"
                    checked={formData.autenticacion_doble_factor}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-emerald-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-emerald-500" />
                      <p className={`font-black ${textPrimary}`}>
                        Autenticación de doble factor (2FA)
                      </p>
                    </div>
                    <p className={`text-sm ${textSecondary} mt-1`}>
                      Exigir código temporal adicional para mayor seguridad
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB: PERSONAL */}
          {activeTab === "personal" && (
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 space-y-6 animate-in fade-in zoom-in duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
                >
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${textPrimary}`}>
                    Datos Personales
                  </h2>
                  <p className={`${textSecondary} font-medium`}>
                    Información de identificación personal
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Nombre
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.nombre
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                  />
                  {erroresValidacion.nombre && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.nombre}
                    </p>
                  )}
                </div>

                {/* Apellido Paterno */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Apellido Paterno
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.apellido_paterno
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                  />
                  {erroresValidacion.apellido_paterno && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.apellido_paterno}
                    </p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                  />
                </div>

                {/* RUT */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Fingerprint className="w-4 h-4" />
                    RUT
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.rut
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="12.345.678-9"
                  />
                  {erroresValidacion.rut && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.rut}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="+56 2 1234 5678"
                  />
                </div>

                {/* Celular */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Phone className="w-4 h-4" />
                    Celular
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="+56 9 8765 4321"
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Calendar className="w-4 h-4" />
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                  />
                </div>

                {/* Género */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="no_binario">No Binario</option>
                    <option value="prefiero_no_decir">
                      Prefiero no decir
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DIRECCIÓN */}
          {activeTab === "direccion" && (
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 space-y-6 animate-in fade-in zoom-in duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
                >
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${textPrimary}`}>
                    Dirección
                  </h2>
                  <p className={`${textSecondary} font-medium`}>
                    Ubicación y datos geográficos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dirección */}
                <div className="md:col-span-2 space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <MapPin className="w-4 h-4" />
                    Dirección Completa
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Calle Principal #123, Piso 4, Depto. 401"
                  />
                </div>

                {/* Ciudad */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Santiago"
                  />
                </div>

                {/* Región */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Región
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Región de Arica y Parinacota">
                      Región de Arica y Parinacota
                    </option>
                    <option value="Región de Tarapacá">
                      Región de Tarapacá
                    </option>
                    <option value="Región de Antofagasta">
                      Región de Antofagasta
                    </option>
                    <option value="Región de Atacama">Región de Atacama</option>
                    <option value="Región de Coquimbo">
                      Región de Coquimbo
                    </option>
                    <option value="Región de Valparaíso">
                      Región de Valparaíso
                    </option>
                    <option value="Región Metropolitana de Santiago">
                      Región Metropolitana de Santiago
                    </option>
                    <option value="Región del Libertador General Bernardo O'Higgins">
                      Región del Libertador General Bernardo O'Higgins
                    </option>
                    <option value="Región del Maule">Región del Maule</option>
                    <option value="Región de Ñuble">Región de Ñuble</option>
                    <option value="Región del Biobío">
                      Región del Biobío
                    </option>
                    <option value="Región de La Araucanía">
                      Región de La Araucanía
                    </option>
                    <option value="Región de Los Ríos">
                      Región de Los Ríos
                    </option>
                    <option value="Región de Los Lagos">
                      Región de Los Lagos
                    </option>
                    <option value="Región de Aysén del General Carlos Ibáñez del Campo">
                      Región de Aysén del General Carlos Ibáñez del Campo
                    </option>
                    <option value="Región de Magallanes y de la Antártica Chilena">
                      Región de Magallanes y de la Antártica Chilena
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORGANIZACIÓN */}
          {activeTab === "organizacion" && (
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 space-y-6 animate-in fade-in zoom-in duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
                >
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${textPrimary}`}>
                    Organización
                  </h2>
                  <p className={`${textSecondary} font-medium`}>
                    Centro médico y sucursal asignados
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Centro */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Building2 className="w-4 h-4" />
                    Centro Médico Principal
                  </label>
                  <select
                    name="id_centro_principal"
                    value={formData.id_centro_principal}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="">Seleccionar centro...</option>
                    {centros.map((centro) => (
                      <option key={centro.id_centro} value={centro.id_centro}>
                        {centro.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sucursal */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Building2 className="w-4 h-4" />
                    Sucursal Principal
                  </label>
                  <select
                    name="id_sucursal_principal"
                    value={formData.id_sucursal_principal}
                    onChange={handleChange}
                    disabled={!formData.id_centro_principal}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">Seleccionar sucursal...</option>
                    {sucursalesFiltradas.map((sucursal) => (
                      <option
                        key={sucursal.id_sucursal}
                        value={sucursal.id_sucursal}
                      >
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!formData.id_centro_principal && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl ${
                    darkMode ? "bg-blue-500/10" : "bg-blue-50"
                  } border-2 border-blue-500/30`}
                >
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`font-bold ${textPrimary} text-sm`}>
                      Selecciona un centro primero
                    </p>
                    <p className={`${textSecondary} text-sm mt-1`}>
                      Una vez seleccionado el centro médico, podrás elegir la
                      sucursal correspondiente
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ROLES */}
          {activeTab === "roles" && (
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 space-y-6 animate-in fade-in zoom-in duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
                >
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2
                    className={`text-3xl font-black ${textPrimary} flex items-center gap-2`}
                  >
                    Roles y Permisos
                    <span className="text-rose-500">*</span>
                  </h2>
                  <p className={`${textSecondary} font-medium`}>
                    Control de acceso dentro del sistema
                  </p>
                </div>
              </div>

              {Array.isArray(rolesCatalog) && rolesCatalog.length === 0 ? (
                <div className="text-center py-12">
                  <Loader2
                    className={`w-12 h-12 animate-spin mx-auto mb-4 ${textSecondary}`}
                  />
                  <p className={`${textSecondary} font-medium`}>
                    Cargando roles disponibles...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {rolesCatalog.map((rol) => {
                    const isSelected = formData.roles.includes(rol.id_rol);

                    return (
                      <label
                        key={rol.id_rol}
                        className={`relative overflow-hidden rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 group ${
                          isSelected
                            ? `bg-gradient-to-br ${theme.primary} text-white border-transparent shadow-2xl ${theme.glow} scale-[1.02]`
                            : darkMode
                            ? "bg-slate-800/50 border-white/10 hover:bg-slate-800 hover:border-white/20"
                            : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRolChange(rol.id_rol)}
                          className="absolute opacity-0 pointer-events-none"
                        />

                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${
                              isSelected
                                ? "bg-white/20 group-hover:scale-110"
                                : darkMode
                                ? "bg-slate-700 group-hover:bg-slate-600"
                                : "bg-slate-100 group-hover:bg-slate-200"
                            }`}
                          >
                            <Shield
                              className={`w-6 h-6 ${
                                isSelected
                                  ? "text-white"
                                  : darkMode
                                  ? "text-slate-300"
                                  : "text-slate-600"
                              }`}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p
                                  className={`text-lg font-black flex items-center gap-2 ${
                                    isSelected ? "text-white" : textPrimary
                                  }`}
                                >
                                  {rol.nombre}
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 animate-in zoom-in duration-200" />
                                  )}
                                </p>

                                {rol.descripcion && (
                                  <p
                                    className={`text-sm font-medium mt-1 ${
                                      isSelected
                                        ? "text-white/80"
                                        : textSecondary
                                    }`}
                                  >
                                    {rol.descripcion}
                                  </p>
                                )}
                              </div>

                              {typeof rol.nivel_jerarquia !== "undefined" && (
                                <div
                                  className={`px-3 py-1 rounded-lg text-xs font-black shadow-lg ${
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : darkMode
                                      ? "bg-slate-700 text-slate-200"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  Nivel {rol.nivel_jerarquia}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Indicador visual de selección */}
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-white/30 border-r-transparent"></div>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {erroresValidacion.roles && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border-2 border-rose-500/50">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <p className="font-bold text-rose-500">
                    {erroresValidacion.roles}
                  </p>
                </div>
              )}

              {formData.roles.length > 0 && (
                <div
                  className={`flex items-center gap-2 p-4 rounded-xl ${
                    darkMode ? "bg-emerald-500/10" : "bg-emerald-50"
                  } border-2 border-emerald-500/30`}
                >
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className={`font-bold ${textPrimary} text-sm`}>
                    {formData.roles.length} rol
                    {formData.roles.length === 1 ? "" : "es"} seleccionado
                    {formData.roles.length === 1 ? "" : "s"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================== */}
          {/* BOTONERA FINAL STICKY */}
          {/* ========================== */}
          <div className="sticky bottom-4 z-40">
            <div
              className={`${cardBg} rounded-2xl shadow-2xl ${theme.glow} border ${borderColor} p-4`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      darkMode ? "bg-slate-800" : "bg-slate-100"
                    }`}
                  >
                    <Target className={`w-5 h-5 ${textPrimary}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${textPrimary}`}>
                      Progreso del formulario
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      {progreso}% completado
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Link
                    href={`/admin/administrativos/${params.id}`}
                    className={`flex-1 sm:flex-none px-6 py-3 rounded-xl transition-all duration-300 font-bold shadow-lg flex items-center justify-center gap-2 ${
                      darkMode
                        ? "bg-slate-800 hover:bg-slate-700"
                        : "bg-slate-100 hover:bg-slate-200"
                    } ${textPrimary} border ${borderColor} hover:scale-105`}
                  >
                    <X className="w-5 h-5" />
                    <span>Cancelar</span>
                  </Link>

                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl hover:shadow-2xl ${theme.glow} transition-all duration-300 shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold flex items-center justify-center gap-2`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
