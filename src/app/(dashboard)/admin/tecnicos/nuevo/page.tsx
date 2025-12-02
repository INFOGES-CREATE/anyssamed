"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Calendar,
  Building2,
  Shield,
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Moon,
  Sun,
  Sparkles,
  Palette,
  Globe,
  Wrench,
  Clock,
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

// (Opcional) Si luego haces buscador de usuarios por API
interface UsuarioBasico {
  id_usuario: number;
  username?: string;
  nombres?: string;
  apellidos?: string;
  nombre_completo?: string;
  email?: string;
  telefono?: string | null;
  extension_telefonica?: string | null;
}

// ==============================
// 🎨 TEMAS PREMIUM (igual que usuarios)
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

export default function NuevoTecnicoPage() {
  const router = useRouter();

  // ==============================
  // ESTADOS GENERALES
  // ==============================
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ==============================
  // 🌗 THEME
  // ==============================
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof colorThemes>("aurora");
  const [mostrarThemeSelector, setMostrarThemeSelector] = useState(false);

  const theme = colorThemes[selectedTheme];
  const bgClass = darkMode
    ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black"
    : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100";

  const cardBg = darkMode
    ? "bg-gradient-to-br from-slate-800/40 via-slate-900/40 to-slate-800/40 backdrop-blur-2xl border-white/5"
    : "bg-white/60 backdrop-blur-2xl border-white/20";

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-300" : "text-slate-600";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-white/10" : "border-slate-200/50";
  const inputBg = darkMode ? "bg-slate-900/50" : "bg-white/80";

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

  const changeTheme = (themeKey: keyof typeof colorThemes) => {
    setSelectedTheme(themeKey);
    localStorage.setItem("colorTheme", themeKey);
    setMostrarThemeSelector(false);
  };

  // ==============================
  // 🌍 CATÁLOGOS
  // ==============================
  const [paises, setPaises] = useState<Pais[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  const [regionesFiltradas, setRegionesFiltradas] = useState<Region[]>([]);
  const [centrosFiltrados, setCentrosFiltrados] = useState<Centro[]>([]);
  const [sucursalesFiltradas, setSucursalesFiltradas] = useState<Sucursal[]>([]);

  // ==============================
  // 🔧 FORM TECNICO
  // ==============================
  const [formData, setFormData] = useState({
    id_usuario: "",
    id_pais: "",
    id_region: "",
    id_centro: "",
    id_sucursal: "",
    area_tecnica: "",
    tipo_tecnico: "soporte",
    turno: "completo",
    hora_inicio: "",
    hora_fin: "",
    descripcion: "",
    nivel_acceso: "basico",
    extension_telefonica: "",
    estado: "activo",
    disponibilidad: "disponible",
    prioridad: "media",
    zona_horaria: "America/Santiago",
    pin_seguridad: "",
    firma_digital: "",
    fecha_inicio: "",
    fecha_termino: "",
    especialidad_tecnica: "",
    certificaciones: "",
    es_global: false,
    supervisor_id: "",
  });

  // ==============================
  // ⏱ VALIDACIÓN SIMPLE
  // ==============================
  const camposObligatorios = [
    "id_usuario",
    "area_tecnica",
    "tipo_tecnico",
    "nivel_acceso",
    "fecha_inicio",
  ];

  const formularioCompleto = camposObligatorios.every(
    (campo) => (formData as any)[campo] && String((formData as any)[campo]).trim() !== ""
  );

  // ==============================
  // 📡 CARGAR CATÁLOGOS
  // ==============================
  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);

      // Países
      try {
        const resPaises = await fetch("/api/geo/paises");
        const dataPaises = await resPaises.json();
        if (dataPaises.success && Array.isArray(dataPaises.paises)) {
          const paisesActivos = dataPaises.paises.filter(
            (p: Pais) => p.activo === 1 && p.prioridad <= 100
          );
          setPaises(paisesActivos);
        }
      } catch (err) {
        console.error("Error al cargar países:", err);
      }

      // Centros
      try {
        const resCentros = await fetch("/api/centros/opciones");
        const dataCentros = await resCentros.json();
        if (dataCentros.success && Array.isArray(dataCentros.opciones.centros)) {
          setCentros(dataCentros.opciones.centros);
        }
      } catch (err) {
        console.error("Error al cargar centros:", err);
      }

      // Sucursales
      try {
        const resSuc = await fetch("/api/sucursales");
        const dataSuc = await resSuc.json();
        if (dataSuc.success && Array.isArray(dataSuc.data)) {
          setSucursales(dataSuc.data);
        }
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
      }
    } catch (err) {
      console.error("Error general catálogos:", err);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // ==============================
  // 🌍 REGIONES
  // ==============================
  const cargarRegiones = async (paisId: string) => {
    if (!paisId) {
      setRegionesFiltradas([]);
      setFormData((prev) => ({
        ...prev,
        id_region: "",
      }));
      return;
    }

    try {
      const resReg = await fetch(
        `/api/geo/regiones?id_pais=${paisId}&inactivos=false`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (resReg.status === 401) {
        console.error("Sesión inválida o expirada al cargar regiones.");
        setRegionesFiltradas([]);
        return;
      }

      if (!resReg.ok) {
        console.error("Error HTTP al cargar regiones:", resReg.status);
        setRegionesFiltradas([]);
        return;
      }

      const dataReg = await resReg.json();
      if (dataReg.success && Array.isArray(dataReg.regiones)) {
        setRegiones(dataReg.regiones);
        setRegionesFiltradas(dataReg.regiones);
      } else {
        setRegionesFiltradas([]);
      }
    } catch (err) {
      console.error("Error al cargar regiones:", err);
      setRegionesFiltradas([]);
    }
  };

  // ==============================
  // EFECTOS: FILTROS CENTROS / SUCURSALES
  // ==============================
  useEffect(() => {
    if (formData.id_pais) {
      // En tu diseño multi país puedes filtrar centros por país si tu API devuelve esa info.
      const activos = centros.filter((c) => c.estado === "activo");
      setCentrosFiltrados(activos);
      setFormData((prev) => ({
        ...prev,
        id_centro: "",
        id_sucursal: "",
      }));
      setSucursalesFiltradas([]);
    }
  }, [formData.id_pais, centros]);

  useEffect(() => {
    if (formData.id_centro) {
      const sucFiltro = sucursales.filter(
        (s) =>
          s.id_centro === parseInt(formData.id_centro) && s.estado === "activo"
      );
      setSucursalesFiltradas(sucFiltro);
      setFormData((prev) => ({
        ...prev,
        id_sucursal: "",
      }));
    } else {
      setSucursalesFiltradas([]);
    }
  }, [formData.id_centro, sucursales]);

  // ==============================
  // 📝 HANDLE INPUT
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
      setFormData((prev) => ({ ...prev, id_pais: value, id_region: "" }));
      cargarRegiones(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ==============================
  // 🧮 ZONA HORARIA BÁSICA
  // ==============================
  const timezones = [
    "America/Santiago",
    "America/Lima",
    "America/Bogota",
    "America/Mexico_City",
    "America/Argentina/Buenos_Aires",
  ];

  // ==============================
  // 🚀 SUBMIT
  // ==============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validaciones mínimas
    if (!formularioCompleto) {
      setError("Debe completar todos los campos obligatorios marcados con *");
      return;
    }

    if (isNaN(Number(formData.id_usuario))) {
      setError("El ID de usuario debe ser numérico");
      return;
    }

    try {
      setLoading(true);

      const paisSeleccionado = paises.find(
        (p) => p.id_pais === parseInt(formData.id_pais || "0")
      );
      const regionSeleccionada = regiones.find(
        (r) => r.id_region === parseInt(formData.id_region || "0")
      );

      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        id_centro: formData.id_centro ? parseInt(formData.id_centro) : null,
        id_sucursal: formData.id_sucursal
          ? parseInt(formData.id_sucursal)
          : null,
        area_tecnica: formData.area_tecnica.trim(),
        tipo_tecnico: formData.tipo_tecnico,
        turno: formData.turno,
        hora_inicio: formData.hora_inicio || null,
        hora_fin: formData.hora_fin || null,
        descripcion: formData.descripcion || null,
        nivel_acceso: formData.nivel_acceso,
        extension_telefonica: formData.extension_telefonica || null,
        estado: formData.estado,
        disponibilidad: formData.disponibilidad,
        prioridad: formData.prioridad,
        pais: paisSeleccionado ? paisSeleccionado.nombre : null,
        region: regionSeleccionada ? regionSeleccionada.nombre : null,
        zona_horaria: formData.zona_horaria || null,
        pin_seguridad: formData.pin_seguridad || null,
        firma_digital: formData.firma_digital || null,
        tickets_resueltos: 0,
        tiempo_promedio_resolucion: 0,
        calificacion_promedio: 0,
        supervisor_id: formData.supervisor_id
          ? parseInt(formData.supervisor_id)
          : null,
        fecha_inicio: formData.fecha_inicio,
        fecha_termino: formData.fecha_termino || null,
        especialidad_tecnica: formData.especialidad_tecnica || null,
        certificaciones: formData.certificaciones || null,
        es_global: formData.es_global ? 1 : 0,
      };

      const response = await fetch("/api/admin/tecnicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Error al crear el técnico");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/tecnicos");
      }, 2000);
    } catch (err) {
      console.error("Error al crear técnico:", err);
      setError("Error inesperado al crear el técnico");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOADING CATÁLOGOS
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
            <Loader2 className="w-16 h-16 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wrench className="w-8 h-8" />
            </div>
          </div>
          <h3 className={`text-2xl font-black ${textPrimary} mb-2`}>
            <Sparkles className="w-6 h-6 inline animate-pulse mr-2" />
            Cargando Formulario de Técnico
          </h3>
          <p className={`${textSecondary} font-medium`}>
            Obteniendo datos de países, centros y sucursales...
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // RENDER PRINCIPAL
  // ==============================
  return (
    <div
      className={`min-h-screen ${bgClass} p-3 md:p-6 lg:p-8 transition-all duration-500 relative overflow-hidden`}
    >
      {/* EFECTO FONDO */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${theme.primary} opacity-5 blur-3xl animate-pulse`}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* CONTROLES FLOTANTES (DARK MODE + THEME) */}
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
                      onClick={() => changeTheme(key as keyof typeof colorThemes)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        selectedTheme === key
                          ? `bg-gradient-to-r ${t.primary} text-white shadow-lg`
                          : `${
                              darkMode
                                ? "hover:bg-white/5"
                                : "hover:bg-slate-50/50"
                            } ${textSecondary}`
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
                onClick={() => router.push("/admin/tecnicos")}
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
                  <Wrench className="w-8 h-8 text-white" />
                </div>
              </div>

              <div>
                <h1 className={`text-3xl font-black ${textPrimary}`}>
                  Nuevo Técnico
                </h1>
                <p
                  className={`${textSecondary} font-medium mt-1 flex items-center gap-2`}
                >
                  <Sparkles className="w-4 h-4" />
                  Configuración avanzada de personal técnico de INFOGES
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
                ¡Técnico creado exitosamente!
              </h3>

              <p
                className={`text-sm mt-1 font-medium ${
                  darkMode ? "text-emerald-300" : "text-emerald-600"
                }`}
              >
                Redirigiendo al listado de técnicos...
              </p>
            </div>
          </div>
        )}

        {/* FORMULARIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BLOQUE 1: USUARIO ASOCIADO */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-black ${textPrimary}`}>
                    Usuario Asociado
                  </h2>
                  <p className={`${textSecondary} text-sm mt-1`}>
                    El técnico se vincula a un usuario ya creado en el sistema
                    (FK <code>id_usuario</code>).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ID USUARIO */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    ID Usuario *
                  </label>
                  <input
                    type="number"
                    name="id_usuario"
                    value={formData.id_usuario}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                    }`}
                    placeholder="Ej: 1"
                  />
                  <p className={`text-xs mt-2 ${textMuted}`}>
                    Usa el ID desde el módulo de usuarios.
                  </p>
                </div>

                {/* EXTENSIÓN TELEFÓNICA */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Extensión Telefónica
                  </label>
                  <div className="relative group">
                    <Phone
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="text"
                      name="extension_telefonica"
                      value={formData.extension_telefonica}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                      }`}
                      placeholder="Ej: 1234"
                    />
                  </div>
                </div>

                {/* ES GLOBAL */}
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="es_global"
                      checked={formData.es_global}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-emerald-600 border-2 rounded focus:ring-2 focus:ring-emerald-500 transition-all accent-emerald-600"
                    />
                    <span
                      className={`text-sm font-semibold transition-colors duration-200 ${
                        darkMode
                          ? "text-slate-300 group-hover:text-white"
                          : "text-slate-700 group-hover:text-slate-900"
                      }`}
                    >
                      Técnico Global (no limitado a un solo centro)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: DATOS TÉCNICOS */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "100ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Datos Técnicos y Rol
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Área técnica */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Área Técnica *
                  </label>
                  <input
                    type="text"
                    name="area_tecnica"
                    value={formData.area_tecnica}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                    placeholder="Ej: Soporte de servidores, Redes, Biomédico..."
                  />
                </div>

                {/* Tipo técnico */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Tipo de Técnico *
                  </label>
                  <select
                    name="tipo_tecnico"
                    value={formData.tipo_tecnico}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                  >
                    <option value="soporte">Soporte</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="ingenieria">Ingeniería</option>
                    <option value="biomedico">Biomédico</option>
                    <option value="sistemas">Sistemas</option>
                    <option value="infraestructura">Infraestructura</option>
                  </select>
                </div>

                {/* Nivel acceso */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Nivel de Acceso *
                  </label>
                  <select
                    name="nivel_acceso"
                    value={formData.nivel_acceso}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                  >
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>

                {/* Disponibilidad */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Disponibilidad
                  </label>
                  <select
                    name="disponibilidad"
                    value={formData.disponibilidad}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="fuera_servicio">Fuera de servicio</option>
                  </select>
                </div>

                {/* Prioridad */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Prioridad
                  </label>
                  <select
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>

                {/* Supervisor */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    ID Supervisor (administrativo)
                  </label>
                  <input
                    type="number"
                    name="supervisor_id"
                    value={formData.supervisor_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                    placeholder="Ej: 5"
                  />
                  <p className={`text-xs mt-2 ${textMuted}`}>
                    FK a la tabla <code>administrativos.id_administrativo</code>
                  </p>
                </div>

                {/* Especialidad técnica */}
                <div className="md:col-span-2">
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Especialidad Técnica
                  </label>
                  <input
                    type="text"
                    name="especialidad_tecnica"
                    value={formData.especialidad_tecnica}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                    placeholder="Ej: Infraestructura crítica, Radiología, Servidores Linux..."
                  />
                </div>

                {/* Certificaciones */}
                <div className="md:col-span-3">
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Certificaciones
                  </label>
                  <textarea
                    name="certificaciones"
                    value={formData.certificaciones}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                    placeholder="Ej: ITIL, Cisco CCNA, certificaciones del MINSAL, etc."
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-3">
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Descripción del Rol
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    }`}
                    placeholder="Resumen de responsabilidades y alcance del técnico."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE 3: HORARIO Y TURNO */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "200ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-700 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Turno y Jornada
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Turno */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Turno
                  </label>
                  <select
                    name="turno"
                    value={formData.turno}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  >
                    <option value="manana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                    <option value="completo">Turno completo</option>
                  </select>
                </div>

                {/* Hora inicio */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  />
                </div>

                {/* Hora fin */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  />
                </div>

                {/* Fecha inicio contrato */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Fecha Inicio *
                  </label>
                  <div className="relative group">
                    <Calendar
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                    />
                  </div>
                </div>

                {/* Fecha término contrato */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Fecha Término
                  </label>
                  <div className="relative group">
                    <Calendar
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
                    />
                    <input
                      type="date"
                      name="fecha_termino"
                      value={formData.fecha_termino}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                        darkMode
                          ? "bg-slate-900/50 border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white/80 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE 4: UBICACIÓN Y CENTRO */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "300ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-black ${textPrimary}`}>
                  Asignación Organizacional y Ubicación
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* País */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    País
                  </label>
                  <select
                    name="id_pais"
                    value={formData.id_pais}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    }`}
                  >
                    <option value="">🌍 Seleccionar país...</option>
                    {paises.map((pais) => (
                      <option key={pais.id_pais} value={pais.id_pais}>
                        {pais.nombre} ({pais.codigo_iso2})
                      </option>
                    ))}
                  </select>
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
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 disabled:bg-slate-900/30"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 disabled:bg-slate-100"
                    }`}
                  >
                    <option value="">📍 Seleccionar región...</option>
                    {regionesFiltradas.map((region) => (
                      <option key={region.id_region} value={region.id_region}>
                        {region.nombre} ({region.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zona horaria */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Zona Horaria
                  </label>
                  <select
                    name="zona_horaria"
                    value={formData.zona_horaria}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    }`}
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Centro */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Centro Médico
                  </label>
                  <select
                    name="id_centro"
                    value={formData.id_centro}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    }`}
                  >
                    <option value="">🏥 Seleccionar centro...</option>
                    {centrosFiltrados.map((centro) => (
                      <option key={centro.id_centro} value={centro.id_centro}>
                        {centro.nombre} - {centro.ciudad}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sucursal */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Sucursal
                  </label>
                  <select
                    name="id_sucursal"
                    value={formData.id_sucursal}
                    onChange={handleInputChange}
                    disabled={!formData.id_centro}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 disabled:bg-slate-900/30"
                        : "bg-white/80 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 disabled:bg-slate-100"
                    }`}
                  >
                    <option value="">🏢 Seleccionar sucursal...</option>
                    {sucursalesFiltradas.map((s) => (
                      <option key={s.id_sucursal} value={s.id_sucursal}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className={`mt-6 p-4 rounded-xl border-2 ${
                  darkMode
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : "bg-indigo-50 border-indigo-200"
                }`}
              >
                <p
                  className={`text-sm font-bold flex items-center gap-2 ${
                    darkMode ? "text-indigo-300" : "text-indigo-800"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  El técnico heredará permisos y contexto del centro/sucursal
                  asignados.
                </p>
              </div>
            </div>
          </div>

          {/* BLOQUE 5: SEGURIDAD */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "400ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-black ${textPrimary}`}>
                    Seguridad Técnica
                  </h2>
                  <p className={`${textSecondary} text-sm mt-1`}>
                    Campos para PIN, firma digital u otros controles.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PIN */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    PIN de Seguridad
                  </label>
                  <input
                    type="text"
                    name="pin_seguridad"
                    maxLength={10}
                    value={formData.pin_seguridad}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    }`}
                    placeholder="Ej: 1234"
                  />
                  <p className={`text-xs mt-2 ${textMuted}`}>
                    Puede usarse para operaciones críticas o confirmaciones
                    rápidas.
                  </p>
                </div>

                {/* Firma digital */}
                <div>
                  <label
                    className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
                  >
                    Firma Digital (hash / bloque)
                  </label>
                  <textarea
                    name="firma_digital"
                    value={formData.firma_digital}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium border-2 ${
                      darkMode
                        ? "bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/20"
                        : "bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    }`}
                    placeholder="Puedes guardar aquí una firma, clave pública o identificador digital."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE 6: RESUMEN Y ACCIONES */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative`}
            style={{ animationDelay: "500ms" }}
          >
            <div
              className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-orange-500 to-rose-600 opacity-5 blur-3xl`}
            ></div>

            <div className="relative z-10">
              <h2 className={`text-2xl font-black ${textPrimary} mb-6`}>
                📋 Resumen de Técnico
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase ${textMuted} mb-1`}
                  >
                    ID Usuario
                  </p>
                  <p className={`text-lg font-black ${textPrimary}`}>
                    {formData.id_usuario || "No especificado"}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase ${textMuted} mb-1`}
                  >
                    Área Técnica
                  </p>
                  <p className={`text-lg font-black ${textPrimary}`}>
                    {formData.area_tecnica || "No especificado"}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 ${
                    darkMode
                      ? "bg-slate-800/30 border-white/10"
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase ${textMuted} mb-1`}
                  >
                    Centro
                  </p>
                  <p className={`text-lg font-black ${textPrimary} truncate`}>
                    {centrosFiltrados.find(
                      (c) => c.id_centro === parseInt(formData.id_centro || "0")
                    )?.nombre || "No asignado"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    formularioCompleto
                      ? darkMode
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-emerald-50 border border-emerald-200"
                      : darkMode
                      ? "bg-rose-500/10 border border-rose-500/30"
                      : "bg-rose-50 border border-rose-200"
                  }`}
                >
                  {formularioCompleto ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      formularioCompleto
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {formularioCompleto
                      ? "Formulario listo para crear"
                      : "Faltan campos obligatorios"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    darkMode
                      ? "bg-slate-800/30 border border-white/10"
                      : "bg-slate-50/50 border border-slate-200"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className={`text-sm font-bold ${textSecondary}`}>
                    Nivel de acceso:{" "}
                    <span className={textPrimary}>{formData.nivel_acceso}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div
            className="flex flex-col sm:flex-row gap-4 sticky bottom-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "600ms" }}
          >
            {/* Cancelar */}
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

            {/* Crear Técnico */}
            <button
              type="submit"
              disabled={loading || success || !formularioCompleto}
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
                    <span>Creando técnico...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Crear Técnico</span>
                  </>
                )}
              </div>
            </button>
          </div>

          <div className="h-4"></div>
        </form>
      </div>
    </div>
  );
}
