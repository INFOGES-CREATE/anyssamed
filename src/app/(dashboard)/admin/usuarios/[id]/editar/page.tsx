// frontend/src/app/admin/usuarios/[id]/editar/page.tsx
"use client";

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
  roles_ids?: string; // ej: "1,2,5"
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
// 🎨 Temas de color
// ==============================
const colorThemes = {
  professional: {
    name: "Profesional",
    primary: "from-blue-600 to-indigo-700",
  },
  elegant: {
    name: "Elegante",
    primary: "from-violet-600 to-purple-700",
  },
  modern: {
    name: "Moderno",
    primary: "from-cyan-600 to-blue-700",
  },
  nature: {
    name: "Natural",
    primary: "from-green-600 to-emerald-700",
  },
  sunset: {
    name: "Ocaso",
    primary: "from-orange-600 to-red-700",
  },
} as const;

export default function EditarUsuarioPage({
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

  // rolesCatalog = todos los roles activos en el sistema (para checkboxes)
  const [rolesCatalog, setRolesCatalog] = useState<RolCatalogo[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // erroresValidacion[field] = mensaje
  const [erroresValidacion, setErroresValidacion] = useState<{
    [key: string]: string;
  }>({});

  // banner visual arriba: éxito / error
  const [banner, setBanner] = useState<
    { type: "success" | "error"; msg: string } | null
  >(null);

  // ==============================
  // 🌗 THEME / UI PREFS
  // ==============================
  const [darkMode, setDarkMode] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof colorThemes>("professional");

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
    roles: [] as number[], // ← IDs de roles activos asignados
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
      "professional";

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
  // 🎨 CLASSES DINÁMICAS
  // ==============================
  const theme = colorThemes[selectedTheme];
  const bgClass = darkMode
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    : "bg-white";
  const cardBg = darkMode
    ? "bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl"
    : "bg-white/95 backdrop-blur-xl";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-300" : "text-slate-600";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-slate-700/50" : "border-slate-200";
  const hoverBg = darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  // helpers banner
  const setOk = (msg: string) => setBanner({ type: "success", msg });
  const setErr = (msg: string) => setBanner({ type: "error", msg });

  // ==============================
  // ⏲ HELPERS
  // ==============================
  // normaliza string fecha del backend ("2024-01-30", "2024-01-30T12:00:00", "2024-01-30 12:00:00")
  const getDateOnly = (val?: string | null) => {
    if (!val) return "";
    if (val.includes("T")) return val.split("T")[0] || "";
    if (val.includes(" ")) return val.split(" ")[0] || "";
    return val;
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
            fetch(`/api/admin/usuarios/${params.id}`, {
              cache: "no-store",
            }),
            fetch("/api/admin/centros", {
              cache: "no-store",
            }),
            fetch("/api/admin/sucursales", {
              cache: "no-store",
            }),
            fetch(`/api/admin/usuarios/${params.id}/roles`, {
              cache: "no-store",
            }),
          ]);

        const usuarioJson = await usuarioRes.json();
        const centrosJson = await centrosRes.json();
        const sucursalesJson = await sucursalesRes.json();
        const rolesJson = await rolesRes.json();

        // ---------- Usuario ----------
        if (usuarioJson.success) {
          const usr: Usuario = usuarioJson.data;
          setUsuario(usr);

          // Convertimos flags tinyint -> boolean
          const requiereCambioPwd = Boolean(
            usr.requiere_cambio_password ?? 0
          );
          const tiene2FA = Boolean(usr.autenticacion_doble_factor ?? 0);

          // IDs de rol desde el GET /roles más abajo
          // (inicialmente vacío: se setea luego con rolesJson)
          let rolesAsignados: number[] = [];

          // fallback por si roles endpoint falla pero viene roles_ids en usuarios/:id
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
          setErr(usuarioJson.error || "Error al cargar usuario");
        }

        // ---------- Centros ----------
        if (centrosJson.success && Array.isArray(centrosJson.data?.centros)) {
          setCentros(centrosJson.data.centros);
        } else {
          setCentros([]);
        }

        // ---------- Sucursales ----------
        if (
          sucursalesJson.success &&
          Array.isArray(sucursalesJson.data?.sucursales)
        ) {
          setSucursales(sucursalesJson.data.sucursales);
        } else {
          setSucursales([]);
        }

        // ---------- Roles ----------
        // Nuevo endpoint /api/admin/usuarios/[id]/roles
        // data.catalogo => lista completa de roles activos
        // data.asignados_ids => IDs activos asignados actualmente al usuario
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

          // sincronizamos roles en el form con lo que devuelve el endpoint
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Filtrar sucursales según centro elegido
  useEffect(() => {
    if (formData.id_centro_principal) {
      const idCentroInt = parseInt(formData.id_centro_principal, 10);
      const filtered = sucursales.filter(
        (s) => s.id_centro === idCentroInt
      );
      setSucursalesFiltradas(filtered);

      // Si la sucursal seleccionada ya no calza con el centro, limpiar
      if (
        formData.id_sucursal_principal &&
        !filtered.find(
          (s) =>
            String(s.id_sucursal) === formData.id_sucursal_principal
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (!formData.email.trim())
      errores.email = "El email es obligatorio";

    if (!formData.nombre.trim())
      errores.nombre = "El nombre es obligatorio";

    if (!formData.apellido_paterno.trim())
      errores.apellido_paterno = "El apellido paterno es obligatorio";

    if (!formData.rut.trim())
      errores.rut = "El RUT es obligatorio";

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

    // Checkbox booleano (switches de seguridad)
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

    // RUT con formato en vivo
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

    // Cambio de centro ⇒ también reset sucursal
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

    // default: texto normal / selects normales
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        setOk("¡Usuario actualizado correctamente!");
        // redirect al perfil
        setTimeout(() => {
          router.push(`/admin/usuarios/${params.id}`);
        }, 1500);
      } else {
        setErr(data.error || "Error al actualizar usuario");
      }
    } catch (err: any) {
      console.error(err);
      setErr(err.message || "Error desconocido al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // ⏳ LOADING FULL SCREEN
  // ==============================
  if (loading) {
    return (
      <div
        className={`min-h-screen ${bgClass} flex items-center justify-center transition-colors duration-300`}
      >
        <div className="text-center">
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${theme.primary} blur-2xl opacity-20 animate-pulse`}
            ></div>
            <Loader2
              className={`relative w-16 h-16 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent animate-spin mx-auto mb-4`}
            />
          </div>
          <p className={`${textSecondary} font-semibold text-lg`}>
            Cargando datos del usuario...
          </p>
          <p className={`${textMuted} text-sm mt-2`}>
            Preparando formulario de edición
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
      className={`min-h-screen ${bgClass} p-4 md:p-6 lg:p-8 transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ========================== */}
        {/* TOOLS FLOTANTES DE TEMA   */}
        {/* ========================== */}
        <div className="fixed top-6 right-6 z-50 flex gap-3">
          {/* Dark / Light toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-4 ${cardBg} ${borderColor} border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group ${hoverBg}`}
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? (
              <Sun className="w-6 h-6 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
            ) : (
              <Moon className="w-6 h-6 text-slate-700 group-hover:rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Selector de paleta */}
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`p-4 ${cardBg} ${borderColor} border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group ${hoverBg}`}
              title="Cambiar tema de color"
            >
              <Palette
                className={`w-6 h-6 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}
              />
            </button>

            {showThemeSelector && (
              <div
                className={`absolute top-full right-0 mt-3 ${cardBg} ${borderColor} border rounded-2xl shadow-2xl p-4 min-w-[250px] animate-in fade-in slide-in-from-top-2 duration-300`}
              >
                <p
                  className={`${textPrimary} font-bold mb-3 text-sm uppercase tracking-wide`}
                >
                  Seleccionar Tema
                </p>
                <div className="space-y-2">
                  {Object.entries(colorThemes).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() =>
                        changeTheme(key as keyof typeof colorThemes)
                      }
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        selectedTheme === key
                          ? `bg-gradient-to-r ${t.primary} text-white shadow-lg scale-105`
                          : `${hoverBg} ${textSecondary} hover:scale-102`
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${t.primary} shadow-lg`}
                      ></div>
                      <span className="font-semibold">{t.name}</span>
                      {selectedTheme === key && (
                        <CheckCircleIcon className="w-5 h-5 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================== */}
        {/* BANNER RESULTADO          */}
        {/* ========================== */}
        {banner && (
          <div
            className={`rounded-2xl p-4 border ${
              banner.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
            }`}
          >
            {banner.msg}
          </div>
        )}

        {/* ========================== */}
        {/* HEADER EDICIÓN             */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl ${borderColor} border overflow-hidden`}
        >
          {/* Gradiente superior decorativo */}
          <div
            className={`h-32 bg-gradient-to-r ${theme.primary} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>

          <div className="p-6 -mt-16 relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex items-end gap-6">
                {/* Botón volver */}
                <Link
                  href={`/admin/usuarios/${params.id}`}
                  className={`p-3 ${
                    darkMode ? "bg-slate-700/80" : "bg-white"
                  } ${borderColor} border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group ${hoverBg} self-start`}
                >
                  <ArrowLeft
                    className={`w-6 h-6 ${textPrimary} group-hover:-translate-x-1 transition-transform duration-300`}
                  />
                </Link>

                {/* Avatar + meta */}
                <div className="flex items-end gap-6 flex-1">
                  {/* Avatar */}
                  <div className="relative group">
                    {usuario?.foto_perfil_url ? (
                      <div className="relative">
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}
                        ></div>
                        <img
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre_completo || ""}
                          className="relative w-28 h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-2xl"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}
                        ></div>
                        <div
                          className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-4 ${
                            darkMode ? "border-slate-800" : "border-white"
                          } shadow-2xl`}
                        >
                          <span className="text-4xl font-black text-white">
                            {usuario?.nombre?.charAt(0)}
                            {usuario?.apellido_paterno?.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Texto header */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <h1
                        className={`text-3xl md:text-4xl font-black ${textPrimary} truncate`}
                      >
                        Editar Usuario
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm mb-2">
                      <div
                        className={`flex items-center gap-2 ${textSecondary} font-medium`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-slate-700" : "bg-slate-100"
                          }`}
                        >
                          <User className="w-4 h-4" />
                        </div>
                        <span>
                          {usuario?.nombre} {usuario?.apellido_paterno}{" "}
                          {usuario?.apellido_materno || ""}
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-2 ${textSecondary} font-medium`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-slate-700" : "bg-slate-100"
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                        </div>
                        <span>{usuario?.email}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div
                        className={`flex items-center gap-2 ${textSecondary} font-medium`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-slate-700" : "bg-slate-100"
                          }`}
                        >
                          <Lock className="w-4 h-4" />
                        </div>
                        <span className="capitalize">
                          Estado: {formData.estado || "—"}
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-2 ${textSecondary} font-medium`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            darkMode ? "bg-slate-700" : "bg-slate-100"
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                        </div>
                        <span>
                          Roles asignados:{" "}
                          {formData.roles?.length
                            ? `${formData.roles.length} rol${
                                formData.roles.length === 1 ? "" : "es"
                              }`
                            : "ninguno"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones rápidas (guardar / cancelar) */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  href={`/admin/usuarios/${params.id}`}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-500/10 to-slate-700/10 text-slate-700 dark:text-slate-300 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105 border ${borderColor} ${hoverBg}`}
                >
                  <X className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Cancelar</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* FORMULARIO COMPLETO        */}
        {/* ========================== */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* ---------- ACCESO Y SEGURIDAD ---------- */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl ${borderColor} border p-6 transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
              >
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Acceso y Seguridad
                </h2>
                <p className={`${textSecondary} font-medium text-sm`}>
                  Credenciales, estado y políticas de seguridad
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`}
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      erroresValidacion.username
                        ? darkMode
                          ? "border-2 border-rose-500 bg-rose-500/10 text-white placeholder-slate-400"
                          : "border-2 border-rose-300 bg-rose-50 text-slate-800 placeholder-slate-400"
                        : darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
                {erroresValidacion.username && (
                  <p
                    className={`mt-1 text-sm font-medium ${
                      darkMode ? "text-rose-400" : "text-rose-600"
                    }`}
                  >
                    {erroresValidacion.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      erroresValidacion.email
                        ? darkMode
                          ? "border-2 border-rose-500 bg-rose-500/10 text-white placeholder-slate-400"
                          : "border-2 border-rose-300 bg-rose-50 text-slate-800 placeholder-slate-400"
                        : darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
                {erroresValidacion.email && (
                  <p
                    className={`mt-1 text-sm font-medium ${
                      darkMode ? "text-rose-400" : "text-rose-600"
                    }`}
                  >
                    {erroresValidacion.email}
                  </p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="pendiente_activacion">
                    Pendiente Activación
                  </option>
                </select>
              </div>
            </div>

            {/* Switches seguridad */}
            <div
              className={`mt-6 pt-6 border-t ${borderColor} space-y-4 transition-colors duration-300`}
            >
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="requiere_cambio_password"
                  checked={formData.requiere_cambio_password}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <div>
                  <p
                    className={`text-sm font-bold ${textPrimary} group-hover:opacity-90`}
                  >
                    Requerir cambio de contraseña
                  </p>
                  <p className={`text-xs ${textSecondary} font-medium`}>
                    El usuario deberá actualizar su clave en el próximo login.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="autenticacion_doble_factor"
                  checked={formData.autenticacion_doble_factor}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <div>
                  <p
                    className={`text-sm font-bold ${textPrimary} group-hover:opacity-90`}
                  >
                    Autenticación de doble factor (2FA)
                  </p>
                  <p className={`text-xs ${textSecondary} font-medium`}>
                    Exigir código temporal adicional al iniciar sesión.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ---------- DATOS PERSONALES ---------- */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl ${borderColor} border p-6 transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
              >
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Datos Personales
                </h2>
                <p className={`${textSecondary} font-medium text-sm`}>
                  Identificación y contacto directo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nombre */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Nombre <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    erroresValidacion.nombre
                      ? darkMode
                        ? "border-2 border-rose-500 bg-rose-500/10 text-white placeholder-slate-400"
                        : "border-2 border-rose-300 bg-rose-50 text-slate-800 placeholder-slate-400"
                      : darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
                {erroresValidacion.nombre && (
                  <p
                    className={`mt-1 text-sm font-medium ${
                      darkMode ? "text-rose-400" : "text-rose-600"
                    }`}
                  >
                    {erroresValidacion.nombre}
                  </p>
                )}
              </div>

              {/* Apellido Paterno */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Apellido Paterno{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    erroresValidacion.apellido_paterno
                      ? darkMode
                        ? "border-2 border-rose-500 bg-rose-500/10 text-white placeholder-slate-400"
                        : "border-2 border-rose-300 bg-rose-50 text-slate-800 placeholder-slate-400"
                      : darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
                {erroresValidacion.apellido_paterno && (
                  <p
                    className={`mt-1 text-sm font-medium ${
                      darkMode ? "text-rose-400" : "text-rose-600"
                    }`}
                  >
                    {erroresValidacion.apellido_paterno}
                  </p>
                )}
              </div>

              {/* Apellido Materno */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Apellido Materno
                </label>
                <input
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
              </div>

              {/* RUT */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  RUT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    erroresValidacion.rut
                      ? darkMode
                        ? "border-2 border-rose-500 bg-rose-500/10 text-white placeholder-slate-400"
                        : "border-2 border-rose-300 bg-rose-50 text-slate-800 placeholder-slate-400"
                      : darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
                {erroresValidacion.rut && (
                  <p
                    className={`mt-1 text-sm font-medium ${
                      darkMode ? "text-rose-400" : "text-rose-600"
                    }`}
                  >
                    {erroresValidacion.rut}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Teléfono
                </label>
                <div className="relative">
                  <Phone
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`}
                  />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
              </div>

              {/* Celular */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Celular
                </label>
                <div className="relative">
                  <Phone
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`}
                  />
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <Calendar
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`}
                  />
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                </div>
              </div>

              {/* Género */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Género
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
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

          {/* ---------- DIRECCIÓN ---------- */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl ${borderColor} border p-6 transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
              >
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Dirección
                </h2>
                <p className={`${textSecondary} font-medium text-sm`}>
                  Ubicación principal del usuario
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dirección */}
              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
              </div>

              {/* Ciudad */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
              </div>

              {/* Región */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Región
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
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
                  <option value="Región de Atacama">
                    Región de Atacama
                  </option>
                  <option value="Región de Coquimbo">
                    Región de Coquimbo
                  </option>
                  <option value="Región de Valparaíso">
                    Región de Valparaíso
                  </option>
                  <option value="Región Metropolitana de Santiago">
                    Región Metropolitana de Santiago
                  </option>
                  <option value="Región del Libertador General Bernardo O’Higgins">
                    Región del Libertador General Bernardo O’Higgins
                  </option>
                  <option value="Región del Maule">
                    Región del Maule
                  </option>
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

          {/* ---------- ORGANIZACIÓN (Centro / Sucursal) ---------- */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl ${borderColor} border p-6 transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
              >
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Organización
                </h2>
                <p className={`${textSecondary} font-medium text-sm`}>
                  Centro médico y sucursal asignados
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Centro */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Centro Médico Principal
                </label>
                <select
                  name="id_centro_principal"
                  value={formData.id_centro_principal}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                >
                  <option value="">Seleccionar centro...</option>
                  {centros.map((centro) => (
                    <option
                      key={centro.id_centro}
                      value={centro.id_centro}
                    >
                      {centro.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sucursal */}
              <div>
                <label
                  className={`block text-sm font-black mb-2 ${textMuted} uppercase tracking-wider`}
                >
                  Sucursal Principal
                </label>
                <select
                  name="id_sucursal_principal"
                  value={formData.id_sucursal_principal}
                  onChange={handleChange}
                  disabled={!formData.id_centro_principal}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-800 disabled:text-slate-500"
                      : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
                  }`}
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
          </div>

          {/* ---------- ROLES Y PERMISOS ---------- */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl ${borderColor} border p-6 transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Roles y Permisos{" "}
                  <span className="text-rose-500">*</span>
                </h2>
                <p className={`${textSecondary} font-medium text-sm`}>
                  Control de acceso dentro del sistema
                </p>
              </div>
            </div>

            {Array.isArray(rolesCatalog) && rolesCatalog.length === 0 ? (
              <div className="text-center py-8">
                <Loader2
                  className={`w-10 h-10 animate-spin mx-auto mb-3 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                />
                <p className={textSecondary}>
                  Cargando roles disponibles...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {rolesCatalog.map((rol) => (
                  <label
                    key={rol.id_rol}
                    className={`relative overflow-hidden rounded-2xl p-5 border-2 group cursor-pointer transition-all duration-300 ${
                      formData.roles.includes(rol.id_rol)
                        ? darkMode
                          ? "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-blue-400/50 shadow-xl"
                          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-400/50 shadow-xl"
                        : darkMode
                        ? "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600"
                        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(rol.id_rol)}
                      onChange={() => handleRolChange(rol.id_rol)}
                      className="absolute opacity-0 pointer-events-none"
                    />

                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl shadow-lg ${
                          formData.roles.includes(rol.id_rol)
                            ? `bg-gradient-to-br ${theme.primary}`
                            : darkMode
                            ? "bg-slate-700"
                            : "bg-slate-100"
                        }`}
                      >
                        <Shield
                          className={`w-6 h-6 ${
                            formData.roles.includes(rol.id_rol)
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
                              className={`text-lg font-black ${textPrimary} flex items-center gap-2`}
                            >
                              {rol.nombre}
                              {formData.roles.includes(rol.id_rol) && (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              )}
                            </p>

                            {rol.descripcion && (
                              <p
                                className={`${textSecondary} text-sm font-medium mt-1`}
                              >
                                {rol.descripcion}
                              </p>
                            )}
                          </div>

                          {typeof rol.nivel_jerarquia !==
                            "undefined" && (
                            <div
                              className={`px-3 py-1 rounded-xl text-xs font-black shadow ${
                                darkMode
                                  ? "bg-slate-700/80 text-slate-200 border border-slate-600"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              Nivel {rol.nivel_jerarquia}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {erroresValidacion.roles && (
              <p
                className={`mt-4 text-sm font-bold ${
                  darkMode ? "text-rose-400" : "text-rose-600"
                }`}
              >
                {erroresValidacion.roles}
              </p>
            )}
          </div>

          {/* ---------- BOTONERA FINAL ---------- */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 sticky bottom-4">
            <Link
              href={`/admin/usuarios/${params.id}`}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl transition-all duration-300 font-bold shadow-lg flex items-center justify-center gap-2 ${hoverBg} ${borderColor} border ${textPrimary}`}
            >
              <X className="w-5 h-5" />
              <span>Cancelar</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className={`w-full sm:w-auto px-8 py-4 bg-gradient-to-r ${theme.primary} text-white rounded-xl hover:shadow-2xl transition-all duration-300 shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Guardando cambios...</span>
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
