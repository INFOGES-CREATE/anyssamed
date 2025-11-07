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
  centro_telefono: string | null; // puede venir null/undefined de la API; mostrará "—"
  centro_email: string | null;    // puede venir null/undefined de la API; mostrará "—"
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

// Temas de color predefinidos
const colorThemes = {
  professional: { name: "Profesional", primary: "from-blue-600 to-indigo-700" },
  elegant: { name: "Elegante", primary: "from-violet-600 to-purple-700" },
  modern: { name: "Moderno", primary: "from-cyan-600 to-blue-700" },
  nature: { name: "Natural", primary: "from-green-600 to-emerald-700" },
  sunset: { name: "Ocaso", primary: "from-orange-600 to-red-700" },
} as const;

export default function DetalleUsuarioPage() {
  const router = useRouter();
  const params = useParams() as { id: string };

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "roles" | "organizacion" | "actividad" | "seguridad">("general");

  const [darkMode, setDarkMode] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof colorThemes>("professional");

  // Seguridad UI state
  const [secLoading, setSecLoading] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFA, setTwoFA] = useState<{ qrDataUrl: string; secretBase32: string } | null>(null);
  const [twoFAToken, setTwoFAToken] = useState("");

  // ====== THEME PERSIST ======
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedTheme = (localStorage.getItem("colorTheme") as keyof typeof colorThemes) || "professional";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const theme = colorThemes[selectedTheme];
  const bgClass = darkMode ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-white";
  const cardBg = darkMode ? "bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-300" : "text-slate-600";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-slate-700/50" : "border-slate-200";
  const hoverBg = darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  const setOk = (msg: string) => setBanner({ type: "success", msg });
  const setErr = (msg: string) => setBanner({ type: "error", msg });

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: {
        bg: darkMode ? "bg-green-500/20 border-green-500/30" : "bg-green-100 border-green-200",
        text: darkMode ? "text-green-300" : "text-green-800",
        icon: CheckCircle,
        label: "Activo",
        glow: "shadow-green-500/20",
      },
      inactivo: {
        bg: darkMode ? "bg-gray-500/20 border-gray-500/30" : "bg-gray-100 border-gray-200",
        text: darkMode ? "text-gray-300" : "text-gray-800",
        icon: XCircle,
        label: "Inactivo",
        glow: "shadow-gray-500/20",
      },
      bloqueado: {
        bg: darkMode ? "bg-red-500/20 border-red-500/30" : "bg-red-100 border-red-200",
        text: darkMode ? "text-red-300" : "text-red-800",
        icon: Lock,
        label: "Bloqueado",
        glow: "shadow-red-500/20",
      },
      pendiente_activacion: {
        bg: darkMode ? "bg-yellow-500/20 border-yellow-500/30" : "bg-yellow-100 border-yellow-200",
        text: darkMode ? "text-yellow-300" : "text-yellow-800",
        icon: Clock,
        label: "Pendiente",
        glow: "shadow-yellow-500/20",
      },
    } as const;

    const badge = (badges as any)[estado] || badges.inactivo;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border-2 ${badge.bg} ${badge.text} shadow-lg ${badge.glow} transition-all duration-300 hover:scale-105`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "N/A";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  const formatFechaCorta = (fecha?: string | null) => {
    if (!fecha) return "N/A";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" });
  };

  // ====== DELETE ======
  const handleEliminar = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/usuarios/${params.id}`, { method: "DELETE" });
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
      const data = await post(`/api/admin/usuarios/${params.id}/security/enable-2fa`);
      if (data.success) {
        setTwoFA({ qrDataUrl: data.qrDataUrl, secretBase32: data.secretBase32 });
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
      const data = await post(`/api/admin/usuarios/${params.id}/security/verify-2fa`, { token: twoFAToken });
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
      const data = await post(`/api/admin/usuarios/${params.id}/security/disable-2fa`);
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
      const data = await post(`/api/admin/usuarios/${params.id}/security/force-password-change`);
      data.success ? setOk("Se forzó cambio de contraseña") : setErr(data.error || "No se pudo forzar cambio");
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
      const data = await post(`/api/admin/usuarios/${params.id}/security/reset-password-token`);
      if (data?.success) {
        const tokenPlano = data.data?.reset_token;
        const expira = data.data?.reset_token_expiry;
        const minutos = data.data?.expires_in_minutes;
        setOk("Token de reseteo generado");
        alert(
          [
            "Token de reseteo de contraseña generado:",
            tokenPlano ? `\n${tokenPlano}` : "\n[sin token?]",
            expira ? `\n\nExpira: ${new Date(expira).toLocaleString("es-CL")}` : "",
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
      const data = await post(`/api/admin/usuarios/${params.id}/security/reset-attempts`);
      data.success ? setOk("Intentos fallidos reseteados") : setErr(data.error || "No se pudo resetear");
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
      data.success ? setOk("Usuario bloqueado") : setErr(data.error || "No se pudo bloquear");
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
      const data = await post(`/api/admin/usuarios/${params.id}/security/unlock`);
      data.success ? setOk("Usuario desbloqueado") : setErr(data.error || "No se pudo desbloquear");
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
      const data = await post(`/api/admin/usuarios/${params.id}/security/terminate-sessions`);
      data.success ? setOk("Sesiones terminadas") : setErr(data.error || "No se pudo terminar sesiones");
    } catch {
      setErr("Error al terminar sesiones");
    } finally {
      setSecLoading(null);
    }
  };

  const downloadFromResponse = async (res: Response, fallbackName: string) => {
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
      const res = await fetch(`/api/admin/usuarios/${params.id}/logs/export?limit=1000`);
      if (!res.ok) throw new Error();
      await downloadFromResponse(res, `usuario_${params.id}_logs.json`);
      setOk("Logs exportados");
    } catch {
      setErr("Error al exportar logs");
    } finally {
      setSecLoading(null);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} blur-2xl opacity-20 animate-pulse`}></div>
            <Loader2 className={`relative w-16 h-16 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent animate-spin mx-auto mb-4`} />
          </div>
          <p className={`${textSecondary} font-semibold text-lg`}>Cargando usuario...</p>
          <p className={`${textMuted} text-sm mt-2`}>Preparando información detallada</p>
        </div>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className={`min-h-screen ${bgClass} p-4 md:p-6 lg:p-8 transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto">
          <div className={`${cardBg} border-2 ${darkMode ? 'border-red-500/30' : 'border-red-200'} rounded-3xl p-8 text-center shadow-2xl`}>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 blur-3xl opacity-20"></div>
              <AlertCircle className="relative w-20 h-20 text-red-500 mx-auto" />
            </div>
            <h2 className={`text-3xl font-black ${textPrimary} mb-3`}>Error</h2>
            <p className={`${textSecondary} mb-8 text-lg`}>{error || "Usuario no encontrado"}</p>
            <button
              onClick={() => router.back()}
              className={`px-8 py-4 bg-gradient-to-r ${theme.primary} text-white rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold text-lg hover:scale-105`}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-6 lg:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controles de Tema - Flotantes */}
        <div className="fixed top-6 right-6 z-50 flex gap-3">
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

          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`p-4 ${cardBg} ${borderColor} border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group ${hoverBg}`}
              title="Cambiar tema de color"
            >
              <Palette className={`w-6 h-6 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`} />
            </button>

            {showThemeSelector && (
              <div className={`absolute top-full right-0 mt-3 ${cardBg} ${borderColor} border rounded-2xl shadow-2xl p-4 min-w-[250px] animate-in fade-in slide-in-from-top-2 duration-300`}>
                <p className={`${textPrimary} font-bold mb-3 text-sm uppercase tracking-wide`}>Seleccionar Tema</p>
                <div className="space-y-2">
                  {Object.entries(colorThemes).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => changeTheme(key as keyof typeof colorThemes)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        selectedTheme === key
                          ? `bg-gradient-to-r ${t.primary} text-white shadow-lg scale-105`
                          : `${hoverBg} ${textSecondary} hover:scale-102`
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${t.primary} shadow-lg`}></div>
                      <span className="font-semibold">{t.name}</span>
                      {selectedTheme === key && <CheckCircle className="w-5 h-5 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner de resultado */}
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

        {/* Header */}
        <div className={`${cardBg} rounded-3xl shadow-2xl ${borderColor} border overflow-hidden`}>
          <div className={`h-32 bg-gradient-to-r ${theme.primary} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>

          <div className="p-6 -mt-16 relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex items-end gap-6">
                <button
                  onClick={() => router.back()}
                  className={`p-3 ${darkMode ? 'bg-slate-700/80' : 'bg-white'} ${borderColor} border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group ${hoverBg} self-start`}
                >
                  <ArrowLeft className={`w-6 h-6 ${textPrimary} group-hover:-translate-x-1 transition-transform duration-300`} />
                </button>

                <div className="flex items-end gap-6 flex-1">
                  {/* Avatar */}
                  <div className="relative group">
                    {usuario.foto_perfil_url ? (
                      <div className="relative">
                        <div className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                        <img
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre_completo}
                          className="relative w-28 h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-2xl"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <div className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                        <div className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-4 ${darkMode ? 'border-slate-800' : 'border-white'} shadow-2xl`}>
                          <span className="text-4xl font-black text-white">
                            {usuario.nombre?.charAt(0)}
                            {usuario.apellido_paterno?.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}
                    {usuario.autenticacion_doble_factor && (
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-2 border-4 border-white dark:border-slate-800 shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {usuario.estado === "activo" && (
                      <div className="absolute -top-2 -right-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                          <div className="relative w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Principal */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-4 mb-3">
                      <h1 className={`text-3xl md:text-4xl font-black ${textPrimary} truncate`}>{usuario.nombre_completo}</h1>
                      {getEstadoBadge(usuario.estado)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                      <div className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <User className="w-4 h-4" />
                        </div>
                        <span>@{usuario.username}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <Mail className="w-4 h-4" />
                        </div>
                        <span>{usuario.email}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <span>{usuario.rut}</span>
                      </div>
                    </div>

                    {usuario.roles_nombres && (
                      <div className="flex flex-wrap gap-2">
                        {usuario.roles_nombres.split(", ").map((rol, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-lg transition-all duration-300 hover:scale-105 ${
                              darkMode
                                ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                                : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-800'
                            }`}
                          >
                            <Shield className="w-4 h-4" />
                            {rol}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/usuarios/${params.id}/editar`}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105`}
                >
                  <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Editar</span>
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105"
                >
                  <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Citas */}
          <div className={`${cardBg} rounded-2xl shadow-xl ${borderColor} border p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl shadow-lg ${darkMode ? 'bg-blue-500/20' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                  <Calendar className={`w-7 h-7 ${darkMode ? 'text-blue-400' : 'text-white'}`} />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              <div className={`text-4xl font-black ${textPrimary} mb-2`}>{usuario.estadisticas?.total_citas || 0}</div>
              <div className={`text-sm ${textMuted} font-semibold uppercase tracking-wide`}>Total Citas</div>
              {usuario.estadisticas?.citas_completadas > 0 && usuario.estadisticas?.total_citas > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((usuario.estadisticas.citas_completadas / usuario.estadisticas.total_citas) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                    {Math.round((usuario.estadisticas.citas_completadas / usuario.estadisticas.total_citas) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Total Actividades */}
          <div className={`${cardBg} rounded-2xl shadow-xl ${borderColor} border p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl shadow-lg ${darkMode ? 'bg-purple-500/20' : 'bg-gradient-to-br from-purple-400 to-purple-600'}`}>
                  <Activity className={`w-7 h-7 ${darkMode ? 'text-purple-400' : 'text-white'}`} />
                </div>
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div className={`text-4xl font-black ${textPrimary} mb-2`}>{usuario.estadisticas?.total_logs || 0}</div>
              <div className={`text-sm ${textMuted} font-semibold uppercase tracking-wide`}>Actividades</div>
              {usuario.estadisticas?.logs_error > 0 && (
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {usuario.estadisticas.logs_error} errores
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Último Acceso */}
          <div className={`${cardBg} rounded-2xl shadow-xl ${borderColor} border p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl shadow-lg ${darkMode ? 'bg-green-500/20' : 'bg-gradient-to-br from-green-400 to-green-600'}`}>
                  <Clock className={`w-7 h-7 ${darkMode ? 'text-green-400' : 'text-white'}`} />
                </div>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div className={`text-lg font-bold ${textPrimary} mb-2`}>
                {usuario.ultimo_login ? formatFechaCorta(usuario.ultimo_login) : "Nunca"}
              </div>
              <div className={`text-sm ${textMuted} font-semibold uppercase tracking-wide`}>Último Acceso</div>
              {usuario.ultimo_login && (
                <div className={`text-xs ${textMuted} mt-2 font-medium`}>
                  {new Date(usuario.ultimo_login).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
          </div>

          {/* Intentos Fallidos */}
          <div className={`${cardBg} rounded-2xl shadow-xl ${borderColor} border p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    usuario.intentos_fallidos > 0
                      ? darkMode ? 'bg-red-500/20' : 'bg-gradient-to-br from-red-400 to-red-600'
                      : darkMode ? 'bg-green-500/20' : 'bg-gradient-to-br from-green-400 to-green-600'
                  }`}
                >
                  <AlertCircle
                    className={`w-7 h-7 ${
                      usuario.intentos_fallidos > 0
                        ? darkMode ? 'text-red-400' : 'text-white'
                        : darkMode ? 'text-green-400' : 'text-white'
                    }`}
                  />
                </div>
                {usuario.intentos_fallidos > 0 ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div className={`text-4xl font-black ${textPrimary} mb-2`}>{usuario.intentos_fallidos || 0}</div>
              <div className={`text-sm ${textMuted} font-semibold uppercase tracking-wide`}>Intentos Fallidos</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${cardBg} rounded-3xl shadow-2xl ${borderColor} border overflow-hidden`}>
          <div className={`${borderColor} border-b overflow-x-auto`}>
            <div className="flex">
              {[
                { id: "general", label: "Información General", icon: User },
                { id: "roles", label: "Roles y Permisos", icon: Shield },
                { id: "organizacion", label: "Organización", icon: Building2 },
                { id: "actividad", label: "Actividad Reciente", icon: Activity },
                { id: "seguridad", label: "Seguridad", icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === (tab.id as any);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-8 py-5 font-bold transition-all duration-300 whitespace-nowrap relative group ${
                      isActive
                        ? `${textPrimary} bg-gradient-to-b ${darkMode ? 'from-slate-700/50 to-transparent' : 'from-slate-50 to-transparent'}`
                        : `${textMuted} ${hoverBg}`
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-sm uppercase tracking-wide">{tab.label}</span>
                    {isActive && <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.primary} rounded-t-full shadow-lg`}></div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* GENERAL */}
            {activeTab === "general" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "RUT", value: usuario.rut, icon: FileText },
                    { label: "Email", value: usuario.email, icon: Mail },
                    { label: "Teléfono", value: usuario.telefono || "No registrado", icon: Phone },
                    { label: "Celular", value: usuario.celular || "No registrado", icon: Phone },
                    {
                      label: "Fecha de Nacimiento",
                      value: usuario.fecha_nacimiento
                        ? `${formatFechaCorta(usuario.fecha_nacimiento)}${usuario.edad ? ` (${usuario.edad} años)` : ""}`
                        : "No registrada",
                      icon: Calendar,
                    },
                    {
                      label: "Género",
                      value: usuario.genero?.replace("_", " ") || "No especificado",
                      icon: User,
                    },
                  ].map((field, index) => {
                    const Icon = field.icon as any;
                    return (
                      <div key={index} className={`p-5 rounded-2xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'} ${borderColor} border group hover:shadow-lg transition-all duration-300`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-xl ${darkMode ? 'bg-slate-600' : 'bg-white'} shadow`}>
                            <Icon className={`w-5 h-5 ${textMuted}`} />
                          </div>
                          <label className={`text-xs font-black ${textMuted} uppercase tracking-wider`}>{field.label}</label>
                        </div>
                        <p className={`text-lg font-semibold ${textPrimary} capitalize`}>{field.value}</p>
                      </div>
                    );
                  })}

                  <div className={`md:col-span-2 p-5 rounded-2xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'} ${borderColor} border group hover:shadow-lg transition-all duration-300`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${darkMode ? 'bg-slate-600' : 'bg-white'} shadow`}>
                        <MapPin className={`w-5 h-5 ${textMuted}`} />
                      </div>
                      <label className={`text-xs font-black ${textMuted} uppercase tracking-wider`}>Dirección</label>
                    </div>
                    <p className={`text-lg font-semibold ${textPrimary}`}>{usuario.direccion || "No registrada"}</p>
                  </div>

                  {[
                    { label: "Ciudad", value: usuario.ciudad || "No registrada", icon: MapPin },
                    { label: "Región", value: usuario.region || "No registrada", icon: MapPin },
                    { label: "Fecha de Creación", value: formatFecha(usuario.fecha_creacion), icon: Calendar },
                    { label: "Última Modificación", value: formatFecha(usuario.fecha_modificacion), icon: Clock },
                  ].map((field, index) => {
                    const Icon = field.icon as any;
                    return (
                      <div key={index} className={`p-5 rounded-2xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'} ${borderColor} border group hover:shadow-lg transition-all duration-300`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-xl ${darkMode ? 'bg-slate-600' : 'bg-white'} shadow`}>
                            <Icon className={`w-5 h-5 ${textMuted}`} />
                          </div>
                          <label className={`text-xs font-black ${textMuted} uppercase tracking-wider`}>{field.label}</label>
                        </div>
                        <p className={`text-lg font-semibold ${textPrimary}`}>{field.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ROLES */}
            {activeTab === "roles" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {usuario.roles_detallados && usuario.roles_detallados.length > 0 ? (
                  usuario.roles_detallados.map((rol, index) => (
                    <div
                      key={rol.id_rol}
                      className={`relative overflow-hidden rounded-3xl p-8 group hover:shadow-2xl transition-all duration-500 ${
                        darkMode ? 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50'
                      } ${borderColor} border-2 hover:scale-[1.02]`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                      <div className="relative">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`relative p-4 bg-gradient-to-br ${theme.primary} rounded-2xl shadow-xl`}>
                              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                              <Shield className="relative w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-2xl font-black ${textPrimary} mb-1`}>{rol.nombre}</h3>
                              {rol.descripcion && <p className={`${textSecondary} font-medium`}>{rol.descripcion}</p>}
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-2xl font-black shadow-lg ${
                            darkMode ? 'bg-purple-500/20 text-purple-300 border-2 border-purple-500/30' : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-2 border-purple-200'
                          }`}>
                            <Award className="w-5 h-5 inline mr-2" />
                            Nivel {rol.nivel_jerarquia}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-700/50' : 'bg-white/50'} backdrop-blur-sm`}>
                            <span className={`text-xs font-black ${textMuted} uppercase tracking-wider block mb-2`}>Asignado desde</span>
                            <p className={`${textPrimary} font-bold text-lg`}>{formatFechaCorta(rol.fecha_asignacion)}</p>
                          </div>
                          {rol.centro_asignado && (
                            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-700/50' : 'bg-white/50'} backdrop-blur-sm`}>
                              <span className={`text-xs font-black ${textMuted} uppercase tracking-wider block mb-2`}>Centro</span>
                              <p className={`${textPrimary} font-bold text-lg`}>{rol.centro_asignado}</p>
                            </div>
                          )}
                          {rol.sucursal_asignada && (
                            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-700/50' : 'bg-white/50'} backdrop-blur-sm`}>
                              <span className={`text-xs font-black ${textMuted} uppercase tracking-wider block mb-2`}>Sucursal</span>
                              <p className={`${textPrimary} font-bold text-lg`}>{rol.sucursal_asignada}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`${textMuted}`}>Sin roles asignados.</div>
                )}
              </div>
            )}

            {/* ORGANIZACIÓN */}
            {activeTab === "organizacion" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`p-6 rounded-2xl ${borderColor} border ${darkMode ? "bg-slate-800/60" : "bg-slate-50"}`}>
                  <h4 className={`text-xl font-black ${textPrimary} mb-4`}>Centro Principal</h4>
                  <div className="space-y-2">
                    <div className={`${textSecondary}`}><strong className={`${textPrimary}`}>Nombre:</strong> {usuario.centro_nombre || "—"}</div>
                    <div className={`${textSecondary}`}><strong className={`${textPrimary}`}>Dirección:</strong> {usuario.centro_direccion || "—"}</div>
                    <div className={`${textSecondary}`}><strong className={`${textPrimary}`}>Teléfono:</strong> {usuario.centro_telefono || "—"}</div>
                    <div className={`${textSecondary}`}><strong className={`${textPrimary}`}>Email:</strong> {usuario.centro_email || "—"}</div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl ${borderColor} border ${darkMode ? "bg-slate-800/60" : "bg-slate-50"}`}>
                  <h4 className={`text-xl font-black ${textPrimary} mb-4`}>Sucursal Principal</h4>
                  <div className="space-y-2">
                    <div className={`${textSecondary}`}><strong className={`${textPrimary}`}>Nombre:</strong> {usuario.sucursal_nombre || "—"}</div>
                    <div className={`${textSecondary}`}><strong className={`${textPrimary}`}>Ciudad:</strong> {usuario.ciudad || "—"}</div>
                    <div className={`${textSecondary}`}><strong className={`${textPrimary}`}>Región:</strong> {usuario.region || "—"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVIDAD */}
            {activeTab === "actividad" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {usuario.ultimas_actividades && usuario.ultimas_actividades.length > 0 ? (
                  usuario.ultimas_actividades.map((log, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl ${borderColor} border flex items-start gap-4 ${darkMode ? "bg-slate-800/50" : "bg-white"}`}>
                      <div className={`p-3 rounded-xl ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                        <Activity className={`w-5 h-5 ${textMuted}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-3 items-center">
                          <span className={`text-xs font-black ${textMuted} uppercase tracking-wide`}>{new Date(log.fecha_hora).toLocaleString("es-CL")}</span>
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-700/60">{log.tipo}</span>
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-700/60">{log.modulo}</span>
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-700/60">{log.accion}</span>
                        </div>
                        <div className={`${textPrimary} font-semibold mt-2`}>{log.descripcion}</div>
                        {log.ip_origen && <div className={`${textMuted} text-xs`}>IP: {log.ip_origen}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`${textMuted}`}>Sin actividad reciente.</div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={exportLogs}
                    disabled={secLoading === "logs"}
                    className={`px-5 py-3 rounded-xl font-bold inline-flex items-center gap-2 border ${borderColor} ${hoverBg}`}
                  >
                    <Download className="w-4 h-4" /> Exportar Logs (.json)
                  </button>
                </div>
              </div>
            )}

            {/* SEGURIDAD */}
            {activeTab === "seguridad" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {/* 2FA */}
                  <div className={`p-6 rounded-2xl ${borderColor} border ${darkMode ? "bg-slate-800/60" : "bg-slate-50"} space-y-3`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      <h4 className={`text-lg font-black ${textPrimary}`}>Doble Factor (2FA)</h4>
                    </div>
                    <div className={`${textSecondary}`}>Estado: {usuario.autenticacion_doble_factor ? "Habilitado" : "Deshabilitado"}</div>
                    <div className="flex flex-wrap gap-3">
                      {!usuario.autenticacion_doble_factor ? (
                        <button
                          onClick={enable2FAInit}
                          disabled={secLoading === "enable2fa"}
                          className={`px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 inline-flex items-center gap-2`}
                        >
                          <QrCode className="w-4 h-4" /> {secLoading === "enable2fa" ? "Generando..." : "Activar 2FA"}
                        </button>
                      ) : (
                        <button
                          onClick={disable2FA}
                          disabled={secLoading === "disable2fa"}
                          className={`px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-pink-700 inline-flex items-center gap-2`}
                        >
                          <Shield className="w-4 h-4" /> {secLoading === "disable2fa" ? "Procesando..." : "Desactivar 2FA"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className={`p-6 rounded-2xl ${borderColor} border ${darkMode ? "bg-slate-800/60" : "bg-slate-50"} space-y-3`}>
                    <div className="flex items-center gap-3 mb-2">
                      <KeyRound className="w-5 h-5 text-blue-500" />
                      <h4 className={`text-lg font-black ${textPrimary}`}>Contraseña</h4>
                    </div>
                    <div className={`${textSecondary}`}>Requiere cambio: {usuario.requiere_cambio_password ? "Sí" : "No"}</div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={forcePasswordChange}
                        disabled={secLoading === "forcepwd"}
                        className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2`}
                      >
                        <RefreshCw className="w-4 h-4" /> Forzar cambio
                      </button>
                      <button
                        onClick={generateResetToken}
                        disabled={secLoading === "resetpwd"}
                        className={`px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r ${theme.primary} inline-flex items-center gap-2`}
                      >
                        <Mail className="w-4 h-4" /> Generar token de reset
                      </button>
                    </div>
                  </div>

                  {/* Estado de cuenta */}
                  <div className={`p-6 rounded-2xl ${borderColor} border ${darkMode ? "bg-slate-800/60" : "bg-slate-50"} space-y-3`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="w-5 h-5 text-red-500" />
                      <h4 className={`text-lg font-black ${textPrimary}`}>Estado de Cuenta</h4>
                    </div>
                    <div className={`${textSecondary}`}>Estado actual: {usuario.estado}</div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={resetAttempts}
                        disabled={secLoading === "attempts"}
                        className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2`}
                      >
                        <RefreshCw className="w-4 h-4" /> Resetear intentos
                      </button>
                      {usuario.estado !== "bloqueado" ? (
                        <button
                          onClick={lockUser}
                          disabled={secLoading === "lock"}
                          className={`px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-pink-700 inline-flex items-center gap-2`}
                        >
                          <Lock className="w-4 h-4" /> Bloquear
                        </button>
                      ) : (
                        <button
                          onClick={unlockUser}
                          disabled={secLoading === "unlock"}
                          className={`px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 inline-flex items-center gap-2`}
                        >
                          <Unlock className="w-4 h-4" /> Desbloquear
                        </button>
                      )}
                      <button
                        onClick={terminateSessions}
                        disabled={secLoading === "sessions"}
                        className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2`}
                      >
                        <LogOut className="w-4 h-4" /> Terminar sesiones
                      </button>
                    </div>
                  </div>

                  {/* Exportaciones */}
                  <div className={`p-6 rounded-2xl ${borderColor} border ${darkMode ? "bg-slate-800/60" : "bg-slate-50"} space-y-3`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Download className="w-5 h-5 text-amber-500" />
                      <h4 className={`text-lg font-black ${textPrimary}`}>Exportaciones</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={exportUser}
                        disabled={secLoading === "export"}
                        className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2`}
                      >
                        <Download className="w-4 h-4" /> Datos Usuario (.json)
                      </button>
                      <button
                        onClick={exportLogs}
                        disabled={secLoading === "logs"}
                        className={`px-4 py-2 rounded-xl font-bold border ${borderColor} ${hoverBg} inline-flex items-center gap-2`}
                      >
                        <Download className="w-4 h-4" /> Logs (.json)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal eliminar */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className={`${cardBg} ${borderColor} border rounded-2xl p-6 max-w-md w-full`}>
              <h3 className={`text-xl font-black ${textPrimary} mb-2`}>Eliminar usuario</h3>
              <p className={`${textSecondary} mb-6`}>¿Seguro que deseas eliminar a {usuario.nombre_completo}? Esta acción no se puede deshacer.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className={`px-4 py-2 rounded-xl ${hoverBg} ${borderColor} border`}>Cancelar</button>
                <button onClick={handleEliminar} disabled={deleting} className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-700 text-white">
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2FA */}
        {show2FAModal && twoFA && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className={`${cardBg} ${borderColor} border rounded-2xl p-6 max-w-md w-full`}>
              <h3 className={`text-xl font-black ${textPrimary} mb-3`}>Activar 2FA</h3>
              <p className={`${textSecondary} mb-4`}>Escanea el QR con Google Authenticator, 1Password o Authy. Luego ingresa el código temporal para confirmar.</p>
              <div className="flex items-center justify-center mb-4">
                <img src={twoFA.qrDataUrl} alt="QR 2FA" className="w-56 h-56 rounded-xl border" />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-bold ${textPrimary} mb-1`}>Código 6 dígitos</label>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFAToken}
                  onChange={(e) => setTwoFAToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className={`w-full rounded-xl border ${borderColor} px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-500/30 ${
                    darkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
                  }`}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShow2FAModal(false)} className={`px-4 py-2 rounded-xl ${hoverBg} ${borderColor} border`}>Cancelar</button>
                <button
                  onClick={enable2FAVerify}
                  disabled={secLoading === "verify2fa" || twoFAToken.length !== 6}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white"
                >
                  {secLoading === "verify2fa" ? "Verificando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
