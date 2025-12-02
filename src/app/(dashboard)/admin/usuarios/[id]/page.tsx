// frontend/src/app/(dashboard)/admin/usuarios/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Shield,
  Activity,
  Clock,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  Star,
  BarChart3,
  KeyRound,
  LogOut,
  QrCode,
  Loader2,
  Moon,
  Sun,
  Palette,
  Award,
  Zap,
  Sparkles,
  Target,
  Fingerprint,
  ShieldCheck,
  Eye,
  Crown,
  Flame,
  Info,
} from "lucide-react";
import Link from "next/link";

interface Usuario {
  id_usuario: number;
  username: string;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  email: string;
  telefono: string | null;
  celular: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  estado: "activo" | "inactivo" | "bloqueado" | "pendiente_activacion";
  fecha_creacion: string;
  fecha_modificacion: string;
  ultimo_login: string | null;
  intentos_fallidos: number;
  id_centro_principal: number | null;
  id_sucursal_principal: number | null;
  foto_perfil_url: string | null;
  requiere_cambio_password: boolean;
  autenticacion_doble_factor: boolean;
  nombre_completo: string;
  edad: number | null;
  centro_nombre: string | null;
  centro_direccion: string | null;
  centro_telefono: string | null;
  centro_email: string | null;
  sucursal_nombre: string | null;
  roles_nombres: string;
  estadisticas: {
    total_citas: number;
    citas_completadas: number;
    citas_canceladas: number;
    total_logs: number;
    logs_error: number;
    ultima_actividad: string | null;
  };
  ultimas_actividades: Array<{
    fecha_hora: string;
    tipo: string;
    modulo: string;
    accion: string;
    descripcion: string;
    ip_origen: string | null;
  }>;
  roles_detallados: Array<{
    id_rol: number;
    nombre: string;
    descripcion: string | null;
    nivel_jerarquia: number;
    fecha_asignacion: string;
    centro_asignado: string | null;
    sucursal_asignada: string | null;
  }>;
}

// ==============================
// 🎨 Temas Premium Mejorados
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

export default function DetalleUsuarioPage() {
  const router = useRouter();
  const params = useParams() as { id: string };

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 🔥 FIX: Typing correcto para el tab
  const [activeTab, setActiveTab] = useState<
    "general" | "roles" | "organizacion" | "actividad" | "seguridad"
  >("general");

  const [darkMode, setDarkMode] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<
    keyof typeof colorThemes
  >("aurora");

  const [secLoading, setSecLoading] = useState<string | null>(null);

  // 🔥 FIX: Typing correcto para el banner
  const [banner, setBanner] = useState<
    { type: "success" | "error"; msg: string } | null
  >(null);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFA, setTwoFA] = useState<{
    qrDataUrl: string;
    secretBase32: string;
  } | null>(null);

  const [twoFAToken, setTwoFAToken] = useState("");


  // ====== THEME PERSIST ======
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedTheme =
      (localStorage.getItem("colorTheme") as keyof typeof colorThemes) ||
      "aurora";
    setDarkMode(savedDarkMode);
    if (savedTheme && colorThemes[savedTheme]) setSelectedTheme(savedTheme);
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

  // ====== DATA LOAD ======
  const cargarUsuario = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/usuarios/${params.id}`);
      const data = await res.json();
      if (data.success) setUsuario(data.data as Usuario);
      else setError(data.error || "Error al cargar usuario");
    } catch (e) {
      console.error(e);
      setError("Error al cargar usuario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuario();
  }, [params.id]);

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

  const setOk = (msg: string) => setBanner({ type: "success", msg });
  const setErr = (msg: string) => setBanner({ type: "error", msg });

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: {
        bg: darkMode
          ? "bg-emerald-500/20 border-emerald-500/30"
          : "bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-300",
        text: darkMode ? "text-emerald-300" : "text-emerald-700",
        icon: CheckCircle,
        label: "Activo",
        glow: "shadow-emerald-500/30",
      },
      inactivo: {
        bg: darkMode
          ? "bg-slate-500/20 border-slate-500/30"
          : "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300",
        text: darkMode ? "text-slate-300" : "text-slate-700",
        icon: XCircle,
        label: "Inactivo",
        glow: "shadow-slate-500/30",
      },
      bloqueado: {
        bg: darkMode
          ? "bg-red-500/20 border-red-500/30"
          : "bg-gradient-to-r from-red-50 to-rose-100 border-red-300",
        text: darkMode ? "text-red-300" : "text-red-700",
        icon: Lock,
        label: "Bloqueado",
        glow: "shadow-red-500/30",
      },
      pendiente_activacion: {
        bg: darkMode
          ? "bg-amber-500/20 border-amber-500/30"
          : "bg-gradient-to-r from-amber-50 to-yellow-100 border-amber-300",
        text: darkMode ? "text-amber-300" : "text-amber-700",
        icon: Clock,
        label: "Pendiente",
        glow: "shadow-amber-500/30",
      },
    } as const;

    const badge = (badges as any)[estado] || badges.inactivo;
    const Icon = badge.icon;
    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black border-2 ${badge.bg} ${badge.text} shadow-lg ${badge.glow} transition-all duration-300 hover:scale-105 uppercase text-xs tracking-wider`}
      >
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "N/A";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFechaCorta = (fecha?: string | null) => {
    if (!fecha) return "N/A";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ====== DELETE ======
  const handleEliminar = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/usuarios/${params.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) router.push("/admin/usuarios?deleted=true");
      else {
        setErr(data.error || "Error al eliminar usuario");
        setShowDeleteModal(false);
      }
    } catch {
      setErr("Error al eliminar usuario");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // ====== SEGURIDAD ACTIONS ======
  const post = async (url: string, body?: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  };

  const enable2FAInit = async () => {
    try {
      setSecLoading("enable2fa");
      const data = await post(
        `/api/admin/usuarios/${params.id}/security/enable-2fa`
      );
      if (data.success) {
        setTwoFA({
          qrDataUrl: data.qrDataUrl,
          secretBase32: data.secretBase32,
        });
        setShow2FAModal(true);
      } else setErr(data.error || "No se pudo iniciar 2FA");
    } catch {
      setErr("Error al iniciar 2FA");
    } finally {
      setSecLoading(null);
    }
  };

  const enable2FAVerify = async () => {
    try {
      setSecLoading("verify2fa");
      const data = await post(
        `/api/admin/usuarios/${params.id}/security/verify-2fa`,
        { token: twoFAToken }
      );
      if (data.success) {
        setOk("2FA habilitado correctamente");
        setShow2FAModal(false);
        setTwoFA(null);
        setTwoFAToken("");
        await cargarUsuario();
      } else setErr(data.error || "Código inválido");
    } catch {
      setErr("Error al verificar 2FA");
    } finally {
      setSecLoading(null);
    }
  };

  const disable2FA = async () => {
    try {
      setSecLoading("disable2fa");
      const data = await post(
        `/api/admin/usuarios/${params.id}/security/disable-2fa`
      );
      if (data.success) {
        setOk("2FA deshabilitado");
        await cargarUsuario();
      } else setErr(data.error || "No se pudo deshabilitar 2FA");
    } catch {
      setErr("Error al deshabilitar 2FA");
    } finally {
      setSecLoading(null);
    }
  };

  const forcePasswordChange = async () => {
    try {
      setSecLoading("forcepwd");
      const data = await post(
        `/api/admin/usuarios/${params.id}/security/force-password-change`
      );
      data.success
        ? setOk("Se forzó cambio de contraseña")
        : setErr(data.error || "No se pudo forzar cambio");
      await cargarUsuario();
    } catch {
      setErr("Error al forzar cambio de contraseña");
    } finally {
      setSecLoading(null);
    }
  };

  const generateResetToken = async () => {
    try {
      setSecLoading("resetpwd");
      const data = await post(
        `/api/admin/usuarios/${params.id}/security/reset-password-token`
      );
      if (data?.success) {
        const tokenPlano = data.data?.reset_token;
        const expira = data.data?.reset_token_expiry;
        const minutos = data.data?.expires_in_minutes;
        setOk("Token de reseteo generado");
        alert(
          [
            "Token de reseteo de contraseña generado:",
            tokenPlano ? `\n${tokenPlano}` : "\n[sin token?]",
            expira
              ? `\n\nExpira: ${new Date(expira).toLocaleString("es-CL")}`
              : "",
            minutos ? `\n(Válido ${minutos} minutos)` : "",
          ].join("")
        );
      } else {
        setErr(data?.error || "No se pudo generar token");
      }
    } catch (e) {
      console.error("Error al generar token de reseteo:", e);
      setErr("Error al generar token de reseteo");
    } finally {
      setSecLoading(null);
    }
  };

  const resetAttempts = async () => {
    try {
      setSecLoading("attempts");
      const data = await post(
        `/api/admin/usuarios/${params.id}/security/reset-attempts`
      );
      data.success
        ? setOk("Intentos fallidos reseteados")
        : setErr(data.error || "No se pudo resetear");
      await cargarUsuario();
    } catch {
      setErr("Error al resetear intentos");
    } finally {
      setSecLoading(null);
    }
  };

  const lockUser = async () => {
    try {
      setSecLoading("lock");
      const data = await post(`/api/admin/usuarios/${params.id}/security/lock`);
      data.success
        ? setOk("Usuario bloqueado")
        : setErr(data.error || "No se pudo bloquear");
      await cargarUsuario();
    } catch {
      setErr("Error al bloquear usuario");
    } finally {
      setSecLoading(null);
    }
  };

  const unlockUser = async () => {
    try {
      setSecLoading("unlock");
      const data = await post(
        `/api/admin/usuarios/${params.id}/security/unlock`
      );
      data.success
        ? setOk("Usuario desbloqueado")
        : setErr(data.error || "No se pudo desbloquear");
      await cargarUsuario();
    } catch {
      setErr("Error al desbloquear usuario");
    } finally {
      setSecLoading(null);
    }
  };

  const terminateSessions = async () => {
    try {
      setSecLoading("sessions");
      const data = await post(
        `/api/admin/usuarios/${params.id}/security/terminate-sessions`
      );
      data.success
        ? setOk("Sesiones terminadas")
        : setErr(data.error || "No se pudo terminar sesiones");
    } catch {
      setErr("Error al terminar sesiones");
    } finally {
      setSecLoading(null);
    }
  };

  const downloadFromResponse = async (
    res: Response,
    fallbackName: string
  ) => {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const dispo = res.headers.get("Content-Disposition") || "";
    const match = dispo.match(/filename="(.+)"/);
    const filename = match ? match[1] : fallbackName;

    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportUser = async () => {
    try {
      setSecLoading("export");
      const res = await fetch(`/api/admin/usuarios/${params.id}/export`);
      if (!res.ok) throw new Error();
      await downloadFromResponse(res, `usuario_${params.id}.json`);
      setOk("Datos exportados");
    } catch {
      setErr("Error al exportar datos");
    } finally {
      setSecLoading(null);
    }
  };

  const exportLogs = async () => {
    try {
      setSecLoading("logs");
      const res = await fetch(
        `/api/admin/usuarios/${params.id}/logs/export?limit=1000`
      );
      if (!res.ok) throw new Error();
      await downloadFromResponse(res, `usuario_${params.id}_logs.json`);
      setOk("Logs exportados");
    } catch {
      setErr("Error al exportar logs");
    } finally {
      setSecLoading(null);
    }
  };

  // ====== TABS CONFIG ======
  const tabs = [
    { id: "general", label: "General", icon: User, color: "text-blue-500" },
    {
      id: "roles",
      label: "Roles",
      icon: Shield,
      color: "text-purple-500",
    },
    {
      id: "organizacion",
      label: "Organización",
      icon: Building2,
      color: "text-emerald-500",
    },
    {
      id: "actividad",
      label: "Actividad",
      icon: Activity,
      color: "text-amber-500",
    },
    {
      id: "seguridad",
      label: "Seguridad",
      icon: Lock,
      color: "text-rose-500",
    },
  ];

  // ====== LOADING PREMIUM ======
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
              style={{
                animationDirection: "reverse",
                animationDuration: "1s",
              }}
            ></div>
          </div>

          <div className="relative z-10">
            <h3
              className={`text-2xl font-black ${textPrimary} mb-2 flex items-center gap-2 justify-center`}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              Cargando Perfil
            </h3>
            <p className={`${textSecondary} font-medium animate-pulse`}>
              Preparando datos del usuario...
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

  // ====== ERROR STATE ======
  if (error || !usuario) {
    return (
      <div
        className={`min-h-screen ${bgClass} p-4 md:p-6 lg:p-8 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`${cardBg} border-2 ${
              darkMode ? "border-red-500/30" : "border-red-200"
            } rounded-3xl p-12 text-center shadow-2xl`}
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 blur-3xl opacity-20"></div>
              <AlertCircle className="relative w-24 h-24 text-red-500 mx-auto" />
            </div>
            <h2 className={`text-4xl font-black ${textPrimary} mb-4`}>
              Error
            </h2>
            <p className={`${textSecondary} mb-8 text-lg`}>
              {error || "Usuario no encontrado"}
            </p>
            <button
              onClick={() => router.back()}
              className={`px-8 py-4 bg-gradient-to-r ${theme.primary} text-white rounded-2xl hover:shadow-2xl ${theme.glow} transition-all duration-300 font-bold text-lg hover:scale-105`}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${bgClass} p-3 md:p-6 transition-all duration-500 relative overflow-hidden`}
    >
      {/* Efectos de fondo animados */}
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
                        <CheckCircle className="w-5 h-5 ml-auto animate-in zoom-in duration-200" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================== */}
        {/* BANNER */}
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
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <button
                      onClick={() => router.push("/admin/usuarios")}
                      className={`p-3 ${
                        darkMode ? "bg-slate-800/80" : "bg-white/80"
                      } ${borderColor} border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105`}
                    >
                      <ArrowLeft
                        className={`w-5 h-5 ${textPrimary} group-hover:-translate-x-1 transition-transform duration-300`}
                      />
                    </button>


                {/* Avatar Premium */}
                <div className="relative group">
                  {usuario.foto_perfil_url ? (
                    <>
                      <div
                        className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                      ></div>
                      <img
                        src={usuario.foto_perfil_url}
                        alt={usuario.nombre_completo}
                        className={`relative w-24 h-24 rounded-2xl object-cover border-2 ${
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
                        className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-2 ${
                          darkMode ? "border-slate-700" : "border-white"
                        } shadow-xl`}
                      >
                        <span className="text-3xl font-black text-white">
                          {usuario.nombre?.charAt(0)}
                          {usuario.apellido_paterno?.charAt(0)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Badges superpuestos */}
                  {usuario.autenticacion_doble_factor && (
                    <div
                      className={`absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full p-2 border-4 ${
                        darkMode ? "border-slate-800" : "border-white"
                      } shadow-lg animate-in zoom-in duration-300`}
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {usuario.estado === "activo" && (
                    <div className="absolute -top-2 -right-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        <div
                          className={`relative w-4 h-4 bg-emerald-500 rounded-full border-2 ${
                            darkMode ? "border-slate-800" : "border-white"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Principal */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className={`text-3xl font-black ${textPrimary}`}>
                      {usuario.nombre_completo}
                    </h1>
                    {getEstadoBadge(usuario.estado)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                    <div
                      className={`flex items-center gap-2 ${textSecondary} font-medium`}
                    >
                      <User className="w-4 h-4" />
                      <span>@{usuario.username}</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${textSecondary} font-medium`}
                    >
                      <Mail className="w-4 h-4" />
                      <span>{usuario.email}</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${textSecondary} font-medium`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>{usuario.rut}</span>
                    </div>
                  </div>

                  {/* Roles */}
                  {usuario.roles_nombres && (
                    <div className="flex flex-wrap gap-2">
                      {usuario.roles_nombres.split(", ").map((rol, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black border-2 shadow-lg transition-all duration-300 hover:scale-105 ${
                            darkMode
                              ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                              : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 text-purple-700"
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {rol}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/usuarios/${params.id}/editar`}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105`}
                >
                  <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Editar</span>
                </Link>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl shadow-lg shadow-red-500/30 hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105"
                >
                  <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* ESTADÍSTICAS PREMIUM */}
        {/* ========================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Total Citas */}
          <div
            className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg bg-gradient-to-br ${theme.primary}`}
                >
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <Star className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div className={`text-4xl font-black ${textPrimary} mb-2`}>
                {usuario.estadisticas?.total_citas || 0}
              </div>
              <div
                className={`text-sm ${textMuted} font-black uppercase tracking-wider`}
              >
                Total Citas
              </div>
              {usuario.estadisticas?.citas_completadas > 0 &&
                usuario.estadisticas?.total_citas > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className={`flex-1 h-2 rounded-full overflow-hidden ${
                        darkMode ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(
                            (usuario.estadisticas.citas_completadas /
                              usuario.estadisticas.total_citas) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black">
                      {Math.round(
                        (usuario.estadisticas.citas_completadas /
                          usuario.estadisticas.total_citas) *
                          100
                      )}
                      %
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Actividades */}
          <div
            className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    darkMode
                      ? "bg-purple-500/20"
                      : "bg-gradient-to-br from-purple-400 to-purple-600"
                  }`}
                >
                  <Activity
                    className={`w-7 h-7 ${
                      darkMode ? "text-purple-400" : "text-white"
                    }`}
                  />
                </div>
                <BarChart3 className="w-5 h-5 text-purple-500 animate-pulse" />
              </div>
              <div className={`text-4xl font-black ${textPrimary} mb-2`}>
                {usuario.estadisticas?.total_logs || 0}
              </div>
              <div
                className={`text-sm ${textMuted} font-black uppercase tracking-wider`}
              >
                Actividades
              </div>
              {usuario.estadisticas?.logs_error > 0 && (
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    {usuario.estadisticas.logs_error} errores
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Último Acceso */}
          <div
            className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    darkMode
                      ? "bg-emerald-500/20"
                      : "bg-gradient-to-br from-emerald-400 to-emerald-600"
                  }`}
                >
                  <Clock
                    className={`w-7 h-7 ${
                      darkMode ? "text-emerald-400" : "text-white"
                    }`}
                  />
                </div>
                <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div className={`text-lg font-bold ${textPrimary} mb-2`}>
                {usuario.ultimo_login
                  ? formatFechaCorta(usuario.ultimo_login)
                  : "Nunca"}
              </div>
              <div
                className={`text-sm ${textMuted} font-black uppercase tracking-wider`}
              >
                Último Acceso
              </div>
              {usuario.ultimo_login && (
                <div className={`text-xs ${textMuted} mt-2 font-medium`}>
                  {new Date(usuario.ultimo_login).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Intentos Fallidos */}
          <div
            className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                usuario.intentos_fallidos > 0
                  ? "from-rose-500 to-red-500"
                  : "from-emerald-500 to-green-500"
              } opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    usuario.intentos_fallidos > 0
                      ? darkMode
                        ? "bg-rose-500/20"
                        : "bg-gradient-to-br from-rose-400 to-red-600"
                      : darkMode
                      ? "bg-emerald-500/20"
                      : "bg-gradient-to-br from-emerald-400 to-green-600"
                  }`}
                >
                  <AlertCircle
                    className={`w-7 h-7 ${
                      usuario.intentos_fallidos > 0
                        ? darkMode
                          ? "text-rose-400"
                          : "text-white"
                        : darkMode
                        ? "text-emerald-400"
                        : "text-white"
                    }`}
                  />
                </div>
                {usuario.intentos_fallidos > 0 ? (
                  <XCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <div className={`text-4xl font-black ${textPrimary} mb-2`}>
                {usuario.intentos_fallidos || 0}
              </div>
              <div
                className={`text-sm ${textMuted} font-black uppercase tracking-wider`}
              >
                Intentos Fallidos
              </div>
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* TABS PREMIUM */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-2 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === (tab.id as any);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
        {/* CONTENIDO TABS */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "200ms" }}
        >
          {/* GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "RUT", value: usuario.rut, icon: FileText },
                  { label: "Email", value: usuario.email, icon: Mail },
                  {
                    label: "Teléfono",
                    value: usuario.telefono || "No registrado",
                    icon: Phone,
                  },
                  {
                    label: "Celular",
                    value: usuario.celular || "No registrado",
                    icon: Phone,
                  },
                  {
                    label: "Fecha de Nacimiento",
                    value: usuario.fecha_nacimiento
                      ? `${formatFechaCorta(usuario.fecha_nacimiento)}${
                          usuario.edad ? ` (${usuario.edad} años)` : ""
                        }`
                      : "No registrada",
                    icon: Calendar,
                  },
                  {
                    label: "Género",
                    value:
                      usuario.genero?.replace("_", " ") || "No especificado",
                    icon: User,
                  },
                ].map((field, index) => {
                  const Icon = field.icon as any;
                  return (
                    <div
                      key={index}
                      className={`p-5 rounded-2xl ${
                        darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                      } ${borderColor} border group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-xl ${
                            darkMode ? "bg-slate-700" : "bg-white"
                          } shadow`}
                        >
                          <Icon className={`w-5 h-5 ${textMuted}`} />
                        </div>
                        <label
                          className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                        >
                          {field.label}
                        </label>
                      </div>
                      <p
                        className={`text-lg font-semibold ${textPrimary} capitalize`}
                      >
                        {field.value}
                      </p>
                    </div>
                  );
                })}

                <div
                  className={`md:col-span-2 p-5 rounded-2xl ${
                    darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                  } ${borderColor} border group hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <MapPin className={`w-5 h-5 ${textMuted}`} />
                    </div>
                    <label
                      className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                    >
                      Dirección
                    </label>
                  </div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    {usuario.direccion || "No registrada"}
                  </p>
                </div>

                {[
                  {
                    label: "Ciudad",
                    value: usuario.ciudad || "No registrada",
                    icon: MapPin,
                  },
                  {
                    label: "Región",
                    value: usuario.region || "No registrada",
                    icon: MapPin,
                  },
                  {
                    label: "Fecha de Creación",
                    value: formatFecha(usuario.fecha_creacion),
                    icon: Calendar,
                  },
                  {
                    label: "Última Modificación",
                    value: formatFecha(usuario.fecha_modificacion),
                    icon: Clock,
                  },
                ].map((field, index) => {
                  const Icon = field.icon as any;
                  return (
                    <div
                      key={index}
                      className={`p-5 rounded-2xl ${
                        darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                      } ${borderColor} border group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-xl ${
                            darkMode ? "bg-slate-700" : "bg-white"
                          } shadow`}
                        >
                          <Icon className={`w-5 h-5 ${textMuted}`} />
                        </div>
                        <label
                          className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                        >
                          {field.label}
                        </label>
                      </div>
                      <p className={`text-lg font-semibold ${textPrimary}`}>
                        {field.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ROLES */}
          {activeTab === "roles" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              {usuario.roles_detallados &&
              usuario.roles_detallados.length > 0 ? (
                usuario.roles_detallados.map((rol, index) => (
                  <div
                    key={rol.id_rol}
                    className={`relative overflow-hidden rounded-3xl p-8 group hover:shadow-2xl transition-all duration-500 ${
                      darkMode
                        ? "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10"
                        : "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50"
                    } ${borderColor} border-2 hover:scale-[1.02]`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${theme.primary} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    ></div>

                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`relative p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-xl`}
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                            <Shield className="relative w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3
                              className={`text-2xl font-black ${textPrimary} mb-1`}
                            >
                              {rol.nombre}
                            </h3>
                            {rol.descripcion && (
                              <p className={`${textSecondary} font-medium`}>
                                {rol.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-2xl font-black shadow-lg ${
                            darkMode
                              ? "bg-purple-500/20 text-purple-300 border-2 border-purple-500/30"
                              : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-2 border-purple-200"
                          }`}
                        >
                          <Award className="w-5 h-5 inline mr-2" />
                          Nivel {rol.nivel_jerarquia}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                          className={`p-4 rounded-2xl ${
                            darkMode ? "bg-slate-700/50" : "bg-white/50"
                          } backdrop-blur-sm`}
                        >
                          <span
                            className={`text-xs font-black ${textMuted} uppercase tracking-wider block mb-2`}
                          >
                            Asignado desde
                          </span>
                          <p className={`${textPrimary} font-bold text-lg`}>
                            {formatFechaCorta(rol.fecha_asignacion)}
                          </p>
                        </div>
                        {rol.centro_asignado && (
                          <div
                            className={`p-4 rounded-2xl ${
                              darkMode ? "bg-slate-700/50" : "bg-white/50"
                            } backdrop-blur-sm`}
                          >
                            <span
                              className={`text-xs font-black ${textMuted} uppercase tracking-wider block mb-2`}
                            >
                              Centro
                            </span>
                            <p className={`${textPrimary} font-bold text-lg`}>
                              {rol.centro_asignado}
                            </p>
                          </div>
                        )}
                        {rol.sucursal_asignada && (
                          <div
                            className={`p-4 rounded-2xl ${
                              darkMode ? "bg-slate-700/50" : "bg-white/50"
                            } backdrop-blur-sm`}
                          >
                            <span
                              className={`text-xs font-black ${textMuted} uppercase tracking-wider block mb-2`}
                            >
                              Sucursal
                            </span>
                            <p className={`${textPrimary} font-bold text-lg`}>
                              {rol.sucursal_asignada}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Shield
                    className={`w-16 h-16 ${textMuted} mx-auto mb-4 opacity-50`}
                  />
                  <p className={`${textMuted} font-medium`}>
                    Sin roles asignados.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ORGANIZACIÓN */}
          {activeTab === "organizacion" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-300">
              <div
                className={`p-6 rounded-2xl ${borderColor} border ${
                  darkMode ? "bg-slate-800/60" : "bg-slate-50"
                } hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${theme.primary}`}
                  >
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-xl font-black ${textPrimary}`}>
                    Centro Principal
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Nombre:</strong>{" "}
                    {usuario.centro_nombre || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Dirección:</strong>{" "}
                    {usuario.centro_direccion || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Teléfono:</strong>{" "}
                    {usuario.centro_telefono || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Email:</strong>{" "}
                    {usuario.centro_email || "—"}
                  </div>
                </div>
              </div>

              <div
                className={`p-6 rounded-2xl ${borderColor} border ${
                  darkMode ? "bg-slate-800/60" : "bg-slate-50"
                } hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${theme.accent}`}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-xl font-black ${textPrimary}`}>
                    Sucursal Principal
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Nombre:</strong>{" "}
                    {usuario.sucursal_nombre || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Ciudad:</strong>{" "}
                    {usuario.ciudad || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Región:</strong>{" "}
                    {usuario.region || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVIDAD */}
          {activeTab === "actividad" && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              {usuario.ultimas_actividades &&
              usuario.ultimas_actividades.length > 0 ? (
                usuario.ultimas_actividades.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl ${borderColor} border flex items-start gap-4 ${
                      darkMode ? "bg-slate-800/50" : "bg-white"
                    } hover:shadow-lg transition-all duration-300 hover:scale-[1.01]`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-slate-100"
                      }`}
                    >
                      <Activity className={`w-5 h-5 ${textMuted}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-3 items-center mb-2">
                        <span
                          className={`text-xs font-black ${textMuted} uppercase tracking-wide`}
                        >
                          {new Date(log.fecha_hora).toLocaleString("es-CL")}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            darkMode
                              ? "bg-slate-700/80"
                              : "bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {log.tipo}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            darkMode
                              ? "bg-slate-700/80"
                              : "bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {log.modulo}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            darkMode
                              ? "bg-slate-700/80"
                              : "bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {log.accion}
                        </span>
                      </div>
                      <div className={`${textPrimary} font-semibold`}>
                        {log.descripcion}
                      </div>
                      {log.ip_origen && (
                        <div className={`${textMuted} text-xs mt-1`}>
                          IP: {log.ip_origen}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity
                    className={`w-16 h-16 ${textMuted} mx-auto mb-4 opacity-50`}
                  />
                  <p className={`${textMuted} font-medium`}>
                    Sin actividad reciente.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={exportLogs}
                  disabled={secLoading === "logs"}
                  className={`px-5 py-3 rounded-xl font-bold inline-flex items-center gap-2 border ${borderColor} ${hoverBg} transition-all duration-300 hover:scale-105`}
                >
                  <Download className="w-4 h-4" />{" "}
                  {secLoading === "logs" ? "Exportando..." : "Exportar Logs"}
                </button>
              </div>
            </div>
          )}

          {/* SEGURIDAD */}
          {activeTab === "seguridad" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* 2FA */}
                <div
                  className={`p-6 rounded-2xl ${borderColor} border ${
                    darkMode ? "bg-slate-800/60" : "bg-slate-50"
                  } space-y-4 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h4 className={`text-lg font-black ${textPrimary}`}>
                      Doble Factor (2FA)
                    </h4>
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    Estado:{" "}
                    <span
                      className={`font-bold ${
                        usuario.autenticacion_doble_factor
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {usuario.autenticacion_doble_factor
                        ? "✓ Habilitado"
                        : "✗ Deshabilitado"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {!usuario.autenticacion_doble_factor ? (
                      <button
                        onClick={enable2FAInit}
                        disabled={secLoading === "enable2fa"}
                        className="px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        <QrCode className="w-4 h-4" />{" "}
                        {secLoading === "enable2fa"
                          ? "Generando..."
                          : "Activar 2FA"}
                      </button>
                    ) : (
                      <button
                        onClick={disable2FA}
                        disabled={secLoading === "disable2fa"}
                        className="px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        <Shield className="w-4 h-4" />{" "}
                        {secLoading === "disable2fa"
                          ? "Procesando..."
                          : "Desactivar 2FA"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Contraseña */}
                <div
                  className={`p-6 rounded-2xl ${borderColor} border ${
                    darkMode ? "bg-slate-800/60" : "bg-slate-50"
                  } space-y-4 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                      <KeyRound className="w-6 h-6 text-white" />
                    </div>
                    <h4 className={`text-lg font-black ${textPrimary}`}>
                      Contraseña
                    </h4>
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    Requiere cambio:{" "}
                    <span
                      className={`font-bold ${
                        usuario.requiere_cambio_password
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {usuario.requiere_cambio_password ? "Sí" : "No"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={forcePasswordChange}
                      disabled={secLoading === "forcepwd"}
                      className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                    >
                      <RefreshCw className="w-4 h-4" /> Forzar cambio
                    </button>
                    <button
                      onClick={generateResetToken}
                      disabled={secLoading === "resetpwd"}
                      className={`px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r ${theme.primary} inline-flex items-center gap-2 hover:shadow-lg ${theme.glow} transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                    >
                      <Mail className="w-4 h-4" /> Token reset
                    </button>
                  </div>
                </div>

                {/* Estado de cuenta */}
                <div
                  className={`p-6 rounded-2xl ${borderColor} border ${
                    darkMode ? "bg-slate-800/60" : "bg-slate-50"
                  } space-y-4 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-red-600">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h4 className={`text-lg font-black ${textPrimary}`}>
                      Estado de Cuenta
                    </h4>
                  </div>
                  <div className={`${textSecondary} font-medium capitalize`}>
                    Estado actual:{" "}
                    <span className={`font-bold ${textPrimary}`}>
                      {usuario.estado}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={resetAttempts}
                      disabled={secLoading === "attempts"}
                      className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                    >
                      <RefreshCw className="w-4 h-4" /> Resetear intentos
                    </button>
                    {usuario.estado !== "bloqueado" ? (
                      <button
                        onClick={lockUser}
                        disabled={secLoading === "lock"}
                        className="px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" /> Bloquear
                      </button>
                    ) : (
                      <button
                        onClick={unlockUser}
                        disabled={secLoading === "unlock"}
                        className="px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        <Unlock className="w-4 h-4" /> Desbloquear
                      </button>
                    )}
                    <button
                      onClick={terminateSessions}
                      disabled={secLoading === "sessions"}
                      className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                    >
                      <LogOut className="w-4 h-4" /> Terminar sesiones
                    </button>
                  </div>
                </div>

                {/* Exportaciones */}
                <div
                  className={`p-6 rounded-2xl ${borderColor} border ${
                    darkMode ? "bg-slate-800/60" : "bg-slate-50"
                  } space-y-4 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <h4 className={`text-lg font-black ${textPrimary}`}>
                      Exportaciones
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={exportUser}
                      disabled={secLoading === "export"}
                      className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                    >
                      <Download className="w-4 h-4" />{" "}
                      {secLoading === "export" ? "Exportando..." : "Datos Usuario"}
                    </button>
                    <button
                      onClick={exportLogs}
                      disabled={secLoading === "logs"}
                      className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                    >
                      <Download className="w-4 h-4" />{" "}
                      {secLoading === "logs" ? "Exportando..." : "Logs"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================== */}
      {/* MODAL ELIMINAR PREMIUM */}
      {/* ========================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`${cardBg} ${borderColor} border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-black ${textPrimary}`}>
                  Eliminar Usuario
                </h3>
                <p className={`${textSecondary} text-sm`}>
                  Acción irreversible
                </p>
              </div>
            </div>

            <p className={`${textSecondary} mb-8 font-medium`}>
              ¿Estás seguro que deseas eliminar a{" "}
              <strong className={textPrimary}>
                {usuario.nombre_completo}
              </strong>
              ? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-6 py-3 rounded-xl ${hoverBg} ${borderColor} border font-bold transition-all duration-300 hover:scale-105`}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={deleting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </span>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================== */}
      {/* MODAL 2FA PREMIUM */}
      {/* ========================== */}
      {show2FAModal && twoFA && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`${cardBg} ${borderColor} border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-black ${textPrimary}`}>
                  Activar 2FA
                </h3>
                <p className={`${textSecondary} text-sm`}>
                  Verificación de doble factor
                </p>
              </div>
            </div>

            <p className={`${textSecondary} mb-6 font-medium`}>
              Escanea el código QR con tu app de autenticación (Google
              Authenticator, Authy, 1Password). Luego ingresa el código de 6
              dígitos.
            </p>

            <div className="flex items-center justify-center mb-6">
              <div
                className={`p-4 rounded-2xl ${
                  darkMode ? "bg-white" : "bg-slate-50"
                } border-2 ${borderColor}`}
              >
                <img
                  src={twoFA.qrDataUrl}
                  alt="QR 2FA"
                  className="w-56 h-56"
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                className={`block text-sm font-black ${textPrimary} mb-2 uppercase tracking-wider`}
              >
                Código de 6 dígitos
              </label>
              <input
                inputMode="numeric"
                maxLength={6}
                value={twoFAToken}
                onChange={(e) =>
                  setTwoFAToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className={`w-full rounded-xl border-2 px-6 py-4 outline-none focus:ring-4 font-bold text-2xl text-center tracking-widest ${
                  darkMode
                    ? "bg-slate-800 text-white border-white/10 focus:ring-emerald-500/30"
                    : "bg-white text-slate-900 border-slate-200 focus:ring-emerald-500/30"
                }`}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShow2FAModal(false)}
                className={`px-6 py-3 rounded-xl ${hoverBg} ${borderColor} border font-bold transition-all duration-300 hover:scale-105`}
              >
                Cancelar
              </button>
              <button
                onClick={enable2FAVerify}
                disabled={
                  secLoading === "verify2fa" || twoFAToken.length !== 6
                }
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                {secLoading === "verify2fa" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}