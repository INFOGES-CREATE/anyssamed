// frontend/src/app/recuperar-password/page.tsx
"use client";

import React, { Suspense, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  Building2,
} from "lucide-react";
import clsx from "clsx";

// ============================================================
// 📋 TIPOS DE DATOS (SOLO UI)
// ============================================================

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

type ResetPhase = "identify" | "verify" | "reset" | "success";

// ============================================================
// 🎨 COMPONENTE: Toast de Notificaciones
// ============================================================

const Toast: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(
      () => onClose(notification.id),
      notification.duration || 5000
    );
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const iconColors = {
    success: "text-emerald-600",
    error: "text-red-600",
    warning: "text-amber-600",
    info: "text-blue-600",
  };

  return (
    <div
      className={clsx(
        "flex items-start gap-3 p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm animate-slide-in-right",
        styles[notification.type]
      )}
    >
      <div
        className={clsx("flex-shrink-0 mt-0.5", iconColors[notification.type])}
      >
        {icons[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="font-semibold text-sm mb-0.5">
            {notification.title}
          </h4>
        )}
        <p className="text-sm opacity-90">{notification.message}</p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  );
};

// ============================================================
// 🎨 COMPONENTE: Indicador de Fuerza de Contraseña (SOLO UI)
// ============================================================

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({
  password,
}) => {
  const checks = [
    { test: password.length >= 12, label: "Mínimo 12 caracteres" },
    { test: /[A-Z]/.test(password), label: "Una letra mayúscula" },
    { test: /[a-z]/.test(password), label: "Una letra minúscula" },
    { test: /[0-9]/.test(password), label: "Un número" },
    {
      test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      label: "Un carácter especial",
    },
    { test: password.length >= 16, label: "16+ caracteres" },
    { test: !/(.)\1{2,}/.test(password), label: "Sin repeticiones" },
  ];

  const passedChecks = checks.filter((c) => c.test).length;
  const percentage = (passedChecks / checks.length) * 100;

  let label = "Débil";
  let color = "bg-red-500";

  if (percentage >= 90) {
    label = "Excelente";
    color = "bg-green-600";
  } else if (percentage >= 75) {
    label = "Muy Buena";
    color = "bg-emerald-500";
  } else if (percentage >= 50) {
    label = "Buena";
    color = "bg-blue-500";
  } else if (percentage >= 30) {
    label = "Regular";
    color = "bg-amber-500";
  }

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium">Seguridad:</span>
        <span
          className={clsx(
            "font-semibold",
            percentage < 30 && "text-red-600",
            percentage >= 30 && percentage < 50 && "text-amber-600",
            percentage >= 50 && percentage < 75 && "text-blue-600",
            percentage >= 75 && percentage < 90 && "text-emerald-600",
            percentage >= 90 && "text-green-600"
          )}
        >
          {label}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full transition-all duration-500 ease-out",
            color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="space-y-1">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex items-center gap-2 text-xs transition-colors duration-300",
              check.test ? "text-emerald-600" : "text-gray-400"
            )}
          >
            <div
              className={clsx(
                "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                check.test ? "bg-emerald-100" : "bg-gray-100"
              )}
            >
              {check.test && <CheckCircle2 className="w-3 h-3" />}
            </div>
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 🎨 COMPONENTE PRINCIPAL: RECUPERAR PASSWORD
// ============================================================

function RecoverPasswordMain() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/dashboard";
  const urlToken = searchParams.get("token");
  const urlEmail = searchParams.get("email") || "";

  const [phase, setPhase] = useState<ResetPhase>(
    urlToken ? "reset" : "identify"
  );

  // Referencias
  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);

  // Estados UI
  const [email, setEmail] = useState(urlEmail);
  const [code, setCode] = useState(urlToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [countdown, setCountdown] = useState(0);

  // ============================================================
  // 🎨 SISTEMA DE NOTIFICACIONES
  // ============================================================

  const addNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      title?: string,
      duration?: number
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [
        ...prev,
        { id, type, message, title, duration },
      ]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ============================================================
  // 🎨 VALIDACIONES VISUALES (SOLO UI)
  // ============================================================

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isCodeValid = code.length === 6;
  const isNewPasswordValid = newPassword.length >= 12;
  const doPasswordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  // ============================================================
  // 🎨 HANDLERS (ENVÍAN AL BACKEND)
  // ============================================================

  const handleSendRecoveryCode = async () => {
    if (!isEmailValid) {
      addNotification(
        "error",
        "Ingresa un correo electrónico válido",
        "Correo inválido"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        addNotification(
          "error",
          data?.error || "No se pudo enviar el correo de recuperación",
          "Error al enviar"
        );
        return;
      }

      addNotification(
        "success",
        "Te hemos enviado un código y enlace de recuperación a tu correo",
        "Correo enviado",
        8000
      );

      setPhase("verify");
      setCountdown(60);
      setCode("");
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 150);
    } catch (err: any) {
      addNotification(
        "error",
        "Error de conexión. Intenta nuevamente.",
        "Error de red"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isCodeValid) {
      addNotification(
        "error",
        "El código debe tener exactamente 6 dígitos",
        "Código inválido"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addNotification(
          "error",
          data?.error || "Código incorrecto o expirado",
          "Verificación fallida"
        );
        setCode("");
        return;
      }

      addNotification(
        "success",
        "Código verificado correctamente",
        "Verificación exitosa",
        2000
      );

      setPhase("reset");
      setTimeout(() => {
        newPasswordInputRef.current?.focus();
      }, 150);
    } catch (err: any) {
      addNotification(
        "error",
        "Error al verificar el código. Intenta nuevamente.",
        "Error de red"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isNewPasswordValid) {
      addNotification(
        "error",
        "La contraseña debe tener al menos 12 caracteres",
        "Contraseña débil"
      );
      return;
    }

    if (!doPasswordsMatch) {
      addNotification(
        "error",
        "Las contraseñas no coinciden",
        "Confirmación inválida"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: newPassword.trim(),
          // se usa token de la URL o el código verificado
          token: urlToken || code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addNotification(
          "error",
          data?.error || "No se pudo actualizar la contraseña",
          "Error al actualizar"
        );
        return;
      }

      addNotification(
        "success",
        "Tu contraseña ha sido actualizada correctamente",
        "Contraseña cambiada",
        2500
      );

      setPhase("success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      addNotification(
        "error",
        "Error de conexión al cambiar la contraseña",
        "Error de red"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || loading) return;
    await handleSendRecoveryCode();
  };

  // ============================================================
  // 🎨 COUNTDOWN
  // ============================================================

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((n) => n - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ============================================================
  // 🎨 CÁLCULO DE PASO ACTUAL
  // ============================================================

  const currentStep =
    phase === "identify" ? 0 : phase === "verify" ? 1 : phase === "reset" ? 2 : 3;

  const stepLabel =
    phase === "identify"
      ? "Paso 1/3"
      : phase === "verify"
      ? "Paso 2/3"
      : phase === "reset"
      ? "Paso 3/3"
      : "";

  // ============================================================
  // 🎨 RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Efectos de fondo premium */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute top-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Contenedor de notificaciones */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header premium */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 rounded-3xl blur-xl opacity-50 animate-pulse-slow" />

            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-3xl shadow-2xl shadow-blue-500/30">
              <Shield className="w-12 h-12 text-white" />

              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              AnyssaMed
            </span>
          </h1>

          <p className="text-gray-600 font-semibold mb-2">
            Recuperación Segura de Contraseña
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Proceso guiado y encriptado</span>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.18)] border border-white/70 ring-1 ring-slate-200/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          {/* Indicador de fase */}
          {phase !== "success" && (
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i <= currentStep && currentStep < 3
                        ? "bg-blue-500 w-6"
                        : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium">{stepLabel}</span>
            </div>
          )}

          {/* FASE: IDENTIFICAR (EMAIL) */}
          {phase === "identify" && (
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Volver al inicio de sesión</span>
              </button>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <KeyRound className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1 text-lg">
                      ¿Olvidaste tu contraseña?
                    </h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Ingresa el correo asociado a tu cuenta. Te enviaremos un{" "}
                      <strong>código de verificación</strong> y un{" "}
                      <strong>enlace de recuperación</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico registrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendRecoveryCode();
                      }
                    }}
                    className={clsx(
                      "w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all outline-none text-gray-900 bg-white",
                      !email || isEmailValid
                        ? "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        : "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    )}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                  {email && isEmailValid && (
                    <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
                  )}
                </div>
                {email && !isEmailValid && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Correo electrónico inválido
                  </p>
                )}
              </div>

              <button
                onClick={handleSendRecoveryCode}
                disabled={loading || !isEmailValid}
                className={clsx(
                  "w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                  loading || !isEmailValid
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando instrucciones...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Enviar correo de recuperación</span>
                  </>
                )}
              </button>

              <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 space-y-1">
                    <p className="font-semibold">
                      🔒 Nunca compartiremos tu contraseña
                    </p>
                    <p>
                      Si no reconoces un correo de recuperación que no solicitaste,
                      repórtalo a seguridad de inmediato.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FASE: VERIFICAR CÓDIGO */}
          {phase === "verify" && (
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() => setPhase("identify")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Cambiar correo</span>
              </button>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-emerald-900 mb-2 text-lg">
                    Revisa tu correo
                  </h3>
                  <p className="text-sm text-emerald-800 mb-1">
                    Hemos enviado un código de 6 dígitos a:
                  </p>
                  <p className="text-sm font-mono text-emerald-900">
                    {email || "tu correo registrado"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Código de verificación (6 dígitos)
                </label>
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setCode(value);
                    if (value.length === 6) {
                      setTimeout(() => handleVerifyCode(), 300);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isCodeValid) {
                      handleVerifyCode();
                    }
                  }}
                  className="w-full px-4 py-5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-center text-3xl font-mono tracking-[0.5em] text-gray-900 bg-white"
                  placeholder="000000"
                  autoComplete="one-time-code"
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-center text-gray-500">
                  El código expira en 10 minutos
                </p>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={loading || !isCodeValid}
                className={clsx(
                  "w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                  loading || !isCodeValid
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verificando código...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Verificar y continuar</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  ¿No recibiste el código?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={countdown > 0 || loading}
                  className={clsx(
                    "text-sm font-semibold transition-colors",
                    countdown > 0 || loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-emerald-600 hover:text-emerald-700 hover:underline"
                  )}
                >
                  {countdown > 0 ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Clock className="w-4 h-4" />
                      Reenviar en {countdown}s
                    </span>
                  ) : (
                    "Reenviar código ahora"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* FASE: RESET PASSWORD */}
          {phase === "reset" && (
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() =>
                  urlToken ? router.push("/login") : setPhase("verify")
                }
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">
                  {urlToken ? "Volver al inicio de sesión" : "Volver al código"}
                </span>
              </button>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 mb-1 text-lg">
                      Elige tu nueva contraseña maestra
                    </h3>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Usa una contraseña única y robusta. Nunca reutilices
                      contraseñas de otros sistemas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    ref={newPasswordInputRef}
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setShowPasswordStrength(e.target.value.length > 0);
                    }}
                    onBlur={() => setShowPasswordStrength(false)}
                    onFocus={() =>
                      setShowPasswordStrength(newPassword.length > 0)
                    }
                    onKeyDown={(e) => {
                      if (
                        e.getModifierState &&
                        e.getModifierState("CapsLock")
                      ) {
                        setCapsLockOn(true);
                      } else {
                        setCapsLockOn(false);
                      }
                      if (e.key === "Enter") {
                        handleResetPassword();
                      }
                    }}
                    className={clsx(
                      "w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition-all outline-none text-gray-900 bg-white",
                      !newPassword || isNewPasswordValid
                        ? "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        : "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    )}
                    placeholder="••••••••••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {capsLockOn && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Bloq Mayús activado</span>
                  </div>
                )}

                {newPassword && !isNewPasswordValid && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Mínimo 12 caracteres
                  </p>
                )}

                {showPasswordStrength && (
                  <div className="mt-3">
                    <PasswordStrengthIndicator password={newPassword} />
                  </div>
                )}
              </div>

              {/* Confirmación */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleResetPassword();
                      }
                    }}
                    className={clsx(
                      "w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition-all outline-none text-gray-900 bg-white",
                      !confirmPassword || doPasswordsMatch
                        ? "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        : "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    )}
                    placeholder="Repite tu nueva contraseña"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {confirmPassword && !doPasswordsMatch && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading || !isNewPasswordValid || !doPasswordsMatch}
                className={clsx(
                  "w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                  loading || !isNewPasswordValid || !doPasswordsMatch
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Actualizando contraseña...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Guardar nueva contraseña</span>
                  </>
                )}
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 space-y-1">
                    <p className="font-semibold">
                      🔐 Encriptación y cumplimiento normativo
                    </p>
                    <p>
                      Tus credenciales se procesan según buenas prácticas de
                      seguridad y estándares como ISO 27001 y HIPAA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FASE: ÉXITO */}
          {phase === "success" && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  ¡Contraseña actualizada!
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                  Ya puedes iniciar sesión con tu{" "}
                  <strong>nueva contraseña</strong>. Por seguridad, evita usarla
                  en otros sistemas.
                </p>
              </div>

              <button
                onClick={() =>
                  router.replace(`/login?next=${encodeURIComponent(next)}`)
                }
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
              >
                <Shield className="w-5 h-5" />
                <span>Ir a iniciar sesión</span>
              </button>

              <p className="text-xs text-gray-500">
                Te recomendamos actualizar tus contraseñas periódicamente.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4 animate-fade-in">
          <p className="text-sm text-gray-600">
            ¿Recordaste tu contraseña?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors"
            >
              Volver a iniciar sesión
            </a>
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <a
              href="/terminos"
              className="hover:text-gray-700 transition-colors"
            >
              Términos
            </a>
            <span>•</span>
            <a
              href="/privacidad"
              className="hover:text-gray-700 transition-colors"
            >
              Privacidad
            </a>
            <span>•</span>
            <a
              href="/seguridad"
              className="hover:text-gray-700 transition-colors"
            >
              Seguridad
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>ISO 27001</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>HIPAA</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Shield className="w-4 h-4 text-purple-500" />
              <span>SOC 2 Type II</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 pt-2">
            © {new Date().getFullYear()} AnyssaMed™ - La plataforma más segura
            del mundo
          </p>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-600 font-medium animate-pulse">
              Cargando recuperación segura...
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Conexión segura verificada</span>
            </div>
          </div>
        </div>
      }
    >
      <RecoverPasswordMain />
    </Suspense>
  );
}
