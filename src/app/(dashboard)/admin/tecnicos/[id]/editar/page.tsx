"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  Wrench,
  MapPin,
  Shield,
  Lock,
  CheckCircle,
  Building2,
  Loader2,
  Moon,
  Sun,
  Phone,
  Mail,
  Calendar,
  Palette,
  CheckCircle as CheckCircleIcon,
  Sparkles,
  Activity,
  Target,
  AlertCircle,
  Clock,
  Globe2,
  Star,
} from "lucide-react";

// ==============================
// 🔐 Tipos / interfaces
// ==============================
interface Centro {
  id_centro: number;
  nombre: string;
}

interface Sucursal {
  id_sucursal: number;
  id_centro: number;
  nombre: string;
}

interface Tecnico {
  id_tecnico: number;
  id_usuario: number;
  id_centro: number | null;
  id_sucursal: number | null;

  area_tecnica: string;
  tipo_tecnico:
    | "soporte"
    | "mantenimiento"
    | "ingenieria"
    | "biomedico"
    | "sistemas"
    | "infraestructura"
    | string;
  turno: "manana" | "tarde" | "noche" | "completo" | string;
  hora_inicio: string | null;
  hora_fin: string | null;
  descripcion: string | null;
  nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador" | string;
  extension_telefonica: string | null;
  estado: "activo" | "inactivo" | "suspendido" | string;
  disponibilidad: "disponible" | "ocupado" | "fuera_servicio" | string;
  prioridad: "baja" | "media" | "alta" | "critica" | string;

  pais: string | null;
  region: string | null;
  zona_horaria: string | null;

  especialidad_tecnica: string | null;
  certificaciones: string | null;

  supervisor_id: number | null;
  es_global: 0 | 1;

  // datos de usuario asociado
  usuario_nombre: string;
  usuario_email: string | null;
  usuario_telefono: string | null;
}

type TabId = "perfil" | "seguridad" | "organizacion" | "horario";

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

export default function EditarTecnicoPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  // ==============================
  // 🧠 STATE PRINCIPAL
  // ==============================
  const [tecnico, setTecnico] = useState<Tecnico | null>(null);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalesFiltradas, setSucursalesFiltradas] = useState<Sucursal[]>(
    []
  );
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
  // 🎨 SISTEMA DE TABS
  // ==============================
  const [activeTab, setActiveTab] = useState<TabId>("perfil");

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
    area_tecnica: "",
    tipo_tecnico: "",
    turno: "",
    hora_inicio: "",
    hora_fin: "",
    descripcion: "",
    nivel_acceso: "",
    extension_telefonica: "",
    estado: "activo" as "activo" | "inactivo" | "suspendido",
    disponibilidad: "disponible" as
      | "disponible"
      | "ocupado"
      | "fuera_servicio",
    prioridad: "media" as "baja" | "media" | "alta" | "critica",
    id_centro: "",
    id_sucursal: "",
    pais: "",
    region: "",
    zona_horaria: "",
    especialidad_tecnica: "",
    certificaciones: "",
    supervisor_id: "",
    es_global: false,
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
  const hoverBg = darkMode ? "hover:bg-white/5" : "hover:bg-slate-50/50";
  const inputBg = darkMode ? "bg-slate-900/50" : "bg-white";

  const setOk = (msg: string) => setBanner({ type: "success", msg });
  const setErr = (msg: string) => setBanner({ type: "error", msg });

  // ==============================
  // ⏲ HELPERS
  // ==============================
  const getTimeOnly = (val?: string | null) => {
    if (!val) return "";
    // HH:MM o HH:MM:SS
    if (val.length >= 5) return val.substring(0, 5);
    return val;
  };

  // ==============================
  // 📊 Cálculo de progreso
  // ==============================
  const calcularProgreso = (): number => {
    const campos = [
      formData.area_tecnica,
      formData.tipo_tecnico,
      formData.turno,
      formData.nivel_acceso,
      formData.estado,
      formData.disponibilidad,
      formData.prioridad,
      formData.id_centro,
      formData.hora_inicio,
      formData.hora_fin,
      formData.especialidad_tecnica,
      formData.descripcion,
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

        const [tecnicoRes, centrosRes, sucursalesRes] = await Promise.all([
          fetch(`/api/admin/tecnicos/${params.id}`, { cache: "no-store" }),
          fetch("/api/admin/centros", { cache: "no-store" }),
          fetch("/api/admin/sucursales", { cache: "no-store" }),
        ]);

        const tecnicoJson = await tecnicoRes.json();
        const centrosJson = await centrosRes.json();
        const sucursalesJson = await sucursalesRes.json();

        if (tecnicoJson.success) {
          const t: Tecnico = tecnicoJson.data;
          setTecnico(t);

          setFormData((prev) => ({
            ...prev,
            area_tecnica: t.area_tecnica || "",
            tipo_tecnico: t.tipo_tecnico || "",
            turno: t.turno || "",
            hora_inicio: getTimeOnly(t.hora_inicio),
            hora_fin: getTimeOnly(t.hora_fin),
            descripcion: t.descripcion || "",
            nivel_acceso: t.nivel_acceso || "",
            extension_telefonica: t.extension_telefonica || "",
            estado: (t.estado as any) || "activo",
            disponibilidad: (t.disponibilidad as any) || "disponible",
            prioridad: (t.prioridad as any) || "media",
            id_centro: t.id_centro ? String(t.id_centro) : "",
            id_sucursal: t.id_sucursal ? String(t.id_sucursal) : "",
            pais: t.pais || "",
            region: t.region || "",
            zona_horaria: t.zona_horaria || "",
            especialidad_tecnica: t.especialidad_tecnica || "",
            certificaciones: t.certificaciones || "",
            supervisor_id: t.supervisor_id ? String(t.supervisor_id) : "",
            es_global: Boolean(t.es_global),
          }));
        } else {
          setErr(tecnicoJson.error || "Error al cargar técnico");
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
      } catch (err: any) {
        console.error(err);
        setErr("Error al cargar datos iniciales del técnico");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [params.id]);

  // Filtrar sucursales según centro
  useEffect(() => {
    if (formData.id_centro) {
      const idCentroInt = parseInt(formData.id_centro, 10);
      const filtered = sucursales.filter((s) => s.id_centro === idCentroInt);
      setSucursalesFiltradas(filtered);

      if (
        formData.id_sucursal &&
        !filtered.find((s) => String(s.id_sucursal) === formData.id_sucursal)
      ) {
        setFormData((prev) => ({
          ...prev,
          id_sucursal: "",
        }));
      }
    } else {
      setSucursalesFiltradas([]);
      if (formData.id_sucursal) {
        setFormData((prev) => ({
          ...prev,
          id_sucursal: "",
        }));
      }
    }
  }, [formData.id_centro, sucursales]);

  // ==============================
  // ✅ VALIDACIONES
  // ==============================
  const validarFormulario = (): boolean => {
    const errores: { [key: string]: string } = {};

    if (!formData.area_tecnica.trim())
      errores.area_tecnica = "El área técnica es obligatoria";
    if (!formData.tipo_tecnico.trim())
      errores.tipo_tecnico = "El tipo de técnico es obligatorio";
    if (!formData.nivel_acceso.trim())
      errores.nivel_acceso = "El nivel de acceso es obligatorio";
    if (!formData.turno.trim())
      errores.turno = "El turno es obligatorio";
    if (!formData.estado.trim())
      errores.estado = "El estado es obligatorio";
    if (!formData.disponibilidad.trim())
      errores.disponibilidad = "La disponibilidad es obligatoria";
    if (!formData.prioridad.trim())
      errores.prioridad = "La prioridad es obligatoria";

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

      if (name === "es_global") {
        setFormData((prev) => ({
          ...prev,
          es_global: checked,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }

      if (erroresValidacion[name]) {
        setErroresValidacion((prevErr) => ({
          ...prevErr,
          [name]: "",
        }));
      }
      return;
    }

    if (name === "id_centro") {
      setFormData((prev) => ({
        ...prev,
        id_centro: value,
        id_sucursal: "",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setErr("Por favor corrige los errores del formulario.");
      return;
    }

    try {
      setSaving(true);
      setBanner(null);

      const res = await fetch(`/api/admin/tecnicos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id_centro: formData.id_centro
            ? parseInt(formData.id_centro, 10)
            : null,
          id_sucursal: formData.id_sucursal
            ? parseInt(formData.id_sucursal, 10)
            : null,
          supervisor_id: formData.supervisor_id
            ? parseInt(formData.supervisor_id, 10)
            : null,
          es_global: formData.es_global ? 1 : 0,
          hora_inicio: formData.hora_inicio || null,
          hora_fin: formData.hora_fin || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOk("¡Técnico actualizado correctamente!");
        setTimeout(() => {
          router.push(`/admin/tecnicos/${params.id}`);
        }, 1500);
      } else {
        setErr(data.error || "Error al actualizar técnico");
      }
    } catch (err: any) {
      console.error(err);
      setErr(err.message || "Error desconocido al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // CONFIG TABS
  // ==============================
  const tabs: Array<{
    id: TabId;
    label: string;
    icon: any;
    color: string;
  }> = [
    { id: "perfil", label: "Perfil Técnico", icon: Wrench, color: "text-sky-500" },
    {
      id: "seguridad",
      label: "Acceso y Nivel",
      icon: Shield,
      color: "text-emerald-500",
    },
    {
      id: "organizacion",
      label: "Organización",
      icon: Building2,
      color: "text-purple-500",
    },
    {
      id: "horario",
      label: "Horario y Zona",
      icon: Clock,
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-32 h-32 bg-gradient-to-r ${theme.primary} rounded-full blur-3xl opacity-20 animate-pulse`}
            ></div>
          </div>

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
              Cargando Técnico
            </h3>
            <p className={`${textSecondary} font-medium animate-pulse`}>
              Preparando editor premium...
            </p>
          </div>

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
  // 🖼 RENDER PRINCIPAL
  // ==============================
  const progreso = calcularProgreso();

  return (
    <div
      className={`min-h-screen ${bgClass} p-3 md:p-6 transition-all duration-500 relative overflow-hidden`}
    >
      {/* Fondo animado */}
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
        {/* CONTROLES FLOTANTES */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
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
                      onClick={() =>
                        changeTheme(key as keyof typeof colorThemes)
                      }
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

        {/* BANNER RESULTADO */}
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

        {/* HEADER PREMIUM TÉCNICO */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Info principal */}
              <div className="flex items-center gap-6">
                <Link
                  href={`/admin/tecnicos/${params.id}`}
                  className={`p-3 ${
                    darkMode ? "bg-slate-800/80" : "bg-white/80"
                  } ${borderColor} border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105`}
                >
                  <ArrowLeft
                    className={`w-5 h-5 ${textPrimary} group-hover:-translate-x-1 transition-transform duration-300`}
                  />
                </Link>

                {/* Avatar derivado del nombre */}
                <div className="relative group">
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                  ></div>
                  <div
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-2 ${
                      darkMode ? "border-slate-700" : "border-white"
                    } shadow-xl`}
                  >
                    <span className="text-2xl font-black text-white">
                      {tecnico?.usuario_nombre
                        ?.split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "T"}
                    </span>
                  </div>
                </div>

                {/* Texto */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className={`text-3xl font-black ${textPrimary}`}>
                      Editar Técnico
                    </h1>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        darkMode
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {String(formData.estado || "activo").toUpperCase()}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {tecnico && (
                      <>
                        <div
                          className={`flex items-center gap-2 ${textSecondary} font-medium`}
                        >
                          <Wrench className="w-4 h-4" />
                          <span>
                            {tecnico.area_tecnica} · {tecnico.tipo_tecnico}
                          </span>
                        </div>
                        {tecnico.usuario_email && (
                          <div
                            className={`flex items-center gap-2 ${textSecondary} font-medium`}
                          >
                            <Mail className="w-4 h-4" />
                            <span>{tecnico.usuario_email}</span>
                          </div>
                        )}
                        {tecnico.usuario_telefono && (
                          <div
                            className={`flex items-center gap-2 ${textSecondary} font-medium`}
                          >
                            <Phone className="w-4 h-4" />
                            <span>{tecnico.usuario_telefono}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones acción */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  form="editar-tecnico-form"
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
                  href={`/admin/tecnicos/${params.id}`}
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
                  <span className={`text-sm font-bold ${textSecondary}`}>
                    Completitud del perfil técnico
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

        {/* TABS PREMIUM */}
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

        {/* FORMULARIO */}
        <form
          id="editar-tecnico-form"
          onSubmit={handleSubmit}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: "200ms" }}
        >
          {/* TAB PERFIL */}
          {activeTab === "perfil" && (
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 space-y-6 animate-in fade-in zoom-in duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
                >
                  <Wrench className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${textPrimary}`}>
                    Perfil Técnico
                  </h2>
                  <p className={`${textSecondary} font-medium`}>
                    Área, tipo, especialidad y descripción del rol
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Área técnica */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Área Técnica
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="area_tecnica"
                    value={formData.area_tecnica}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.area_tecnica
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                  />
                  {erroresValidacion.area_tecnica && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.area_tecnica}
                    </p>
                  )}
                </div>

                {/* Tipo técnico */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Tipo de Técnico
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="tipo_tecnico"
                    value={formData.tipo_tecnico}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.tipo_tecnico
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10"
                        : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="soporte">Soporte</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="ingenieria">Ingeniería</option>
                    <option value="biomedico">Biomédico</option>
                    <option value="sistemas">Sistemas</option>
                    <option value="infraestructura">Infraestructura</option>
                    <option value="otro">Otro</option>
                  </select>
                  {erroresValidacion.tipo_tecnico && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.tipo_tecnico}
                    </p>
                  )}
                </div>

                {/* Prioridad */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Prioridad Operacional
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.prioridad
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10"
                        : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                  {erroresValidacion.prioridad && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.prioridad}
                    </p>
                  )}
                </div>

                {/* Especialidad técnica */}
                <div className="md:col-span-2 space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Star className="w-4 h-4" />
                    Especialidad Técnica
                  </label>
                  <input
                    type="text"
                    name="especialidad_tecnica"
                    value={formData.especialidad_tecnica}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Redes Cisco, Servidores Linux, Infraestructura hospitalaria, etc."
                  />
                </div>

                {/* Certificaciones */}
                <div className="md:col-span-3 space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Certificaciones
                  </label>
                  <textarea
                    name="certificaciones"
                    value={formData.certificaciones}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Ej: ITIL v4, CCNA, Certificación biomédica, etc."
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-3 space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Descripción del Rol
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Describe las principales responsabilidades, ámbito de acción y tecnologías que administra este técnico..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB SEGURIDAD / NIVEL */}
          {activeTab === "seguridad" && (
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
                  <h2 className={`text-3xl font-black ${textPrimary}`}>
                    Acceso y Estado
                  </h2>
                  <p className={`${textSecondary} font-medium`}>
                    Nivel de acceso, disponibilidad y alcance del técnico
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nivel acceso */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Nivel de Acceso
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="nivel_acceso"
                    value={formData.nivel_acceso}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.nivel_acceso
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10"
                        : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                  {erroresValidacion.nivel_acceso && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.nivel_acceso}
                    </p>
                  )}
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Estado
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.estado
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10"
                        : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                  {erroresValidacion.estado && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.estado}
                    </p>
                  )}
                </div>

                {/* Disponibilidad */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Disponibilidad
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="disponibilidad"
                    value={formData.disponibilidad}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.disponibilidad
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10"
                        : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="fuera_servicio">Fuera de servicio</option>
                  </select>
                  {erroresValidacion.disponibilidad && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.disponibilidad}
                    </p>
                  )}
                </div>

                {/* Extensión telefónica */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Phone className="w-4 h-4" />
                    Extensión Telefónica
                  </label>
                  <input
                    type="text"
                    name="extension_telefonica"
                    value={formData.extension_telefonica}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Ej: 123"
                  />
                </div>

                {/* Supervisor ID */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Supervisor (ID Usuario)
                  </label>
                  <input
                    type="number"
                    name="supervisor_id"
                    value={formData.supervisor_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="ID del usuario supervisor (opcional)"
                  />
                </div>
              </div>

              {/* Global */}
              <div
                className={`mt-8 pt-8 border-t-2 ${borderColor} space-y-5`}
              >
                <label
                  className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 group ${
                    darkMode
                      ? "bg-slate-800/50 hover:bg-slate-800"
                      : "bg-slate-50 hover:bg-slate-100"
                  } border-2 ${
                    formData.es_global
                      ? `border-emerald-500/50 ${theme.glow}`
                      : borderColor
                  }`}
                >
                  <input
                    type="checkbox"
                    name="es_global"
                    checked={formData.es_global}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-emerald-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe2 className="w-5 h-5 text-emerald-500" />
                      <p className={`font-black ${textPrimary}`}>
                        Técnico Global (puede operar en varios centros)
                      </p>
                    </div>
                    <p className={`text-sm ${textSecondary} mt-1`}>
                      Si está activo, el técnico puede ser asignado a distintos
                      centros y sucursales según la operación.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB ORGANIZACIÓN */}
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
                    Centro, sucursal y localización del técnico
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
                    Centro Médico
                  </label>
                  <select
                    name="id_centro"
                    value={formData.id_centro}
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
                    Sucursal
                  </label>
                  <select
                    name="id_sucursal"
                    value={formData.id_sucursal}
                    onChange={handleChange}
                    disabled={!formData.id_centro}
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

                {/* País */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    País
                  </label>
                  <input
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Chile"
                  />
                </div>

                {/* Región */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Región
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Región del Maule"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB HORARIO */}
          {activeTab === "horario" && (
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 space-y-6 animate-in fade-in zoom-in duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-lg`}
                >
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${textPrimary}`}>
                    Horario y Zona Horaria
                  </h2>
                  <p className={`${textSecondary} font-medium`}>
                    Configura el turno, horario de trabajo y zona horaria
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Turno */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Turno
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="turno"
                    value={formData.turno}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      erroresValidacion.turno
                        ? "border-rose-500"
                        : darkMode
                        ? "border-white/10"
                        : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="manana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                    <option value="completo">Jornada Completa</option>
                  </select>
                  {erroresValidacion.turno && (
                    <p className="mt-1 text-sm font-medium text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {erroresValidacion.turno}
                    </p>
                  )}
                </div>

                {/* Hora inicio */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                  />
                </div>

                {/* Hora fin */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                  />
                </div>

                {/* Zona horaria */}
                <div className="space-y-2 md:col-span-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    <Globe2 className="w-4 h-4" />
                    Zona Horaria
                  </label>
                  <input
                    type="text"
                    name="zona_horaria"
                    value={formData.zona_horaria}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode ? "border-white/10" : "border-slate-200"
                    } ${textPrimary} placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-500/50`}
                    placeholder="Ej: America/Santiago"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BOTONERA FINAL STICKY */}
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
                    href={`/admin/tecnicos/${params.id}`}
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
