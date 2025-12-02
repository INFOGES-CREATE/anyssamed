// frontend/src/app/login/page.tsx
"use client";

import React, { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LogIn,
  Shield,
  KeyRound,
  Smartphone,
  Fingerprint,
  Scan,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  Info,
  Sparkles,
  ShieldCheck,
  Clock,
  Building2,
  Globe,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

export const dynamic = "force-dynamic";

// ============================================================
// 🔐 TIPOS DE DATOS (SOLO UI, SIN LÓGICA DE SEGURIDAD)
// ============================================================

type AuthPhase =
  | "select"
  | "credentials"
  | "mfa"
  | "biometric"
  | "sms"
  | "force_change"
  | "security_check";

type BiometricType = "fingerprint" | "face" | null;
type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
  strength?: number;
}

interface SecurityDetails {
  location?: string;
  device?: string;
  time?: string;
}

// ============================================================
// 🔐 REGLAS DE VALIDACIÓN (PURAMENTE UX, NO SEGURIDAD REAL)
// ============================================================

const PASSWORD_RULES: ValidationRule[] = [
  {
    test: (val) => val.length >= 12,
    message: "Mínimo 12 caracteres",
    strength: 2,
  },
  {
    test: (val) => /[A-Z]/.test(val),
    message: "Una letra mayúscula",
    strength: 1,
  },
  {
    test: (val) => /[a-z]/.test(val),
    message: "Una letra minúscula",
    strength: 1,
  },
  {
    test: (val) => /[0-9]/.test(val),
    message: "Un número",
    strength: 1,
  },
  {
    test: (val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val),
    message: "Un carácter especial (!@#$%^&*...)",
    strength: 2,
  },
  {
    test: (val) => val.length >= 16,
    message: "16+ caracteres (máxima seguridad)",
    strength: 3,
  },
  {
    test: (val) => !/(.)\1{2,}/.test(val),
    message: "Sin caracteres repetidos (aaa, bbb)",
    strength: 1,
  },
];

// ============================================================
// 🔐 UTILIDADES PARA WEBAUTHN (REQUERIDAS POR EL ESTÁNDAR)
// ============================================================

/**
 * Convierte ArrayBuffer a Base64url
 */
const bufferToBase64url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return base64;
};

/**
 * Convierte Base64url a Uint8Array
 */
const base64urlToUint8Array = (base64url: string): Uint8Array => {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// ============================================================
// 🔐 COMPONENTE: Toast de Notificaciones
// ============================================================

const Toast: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
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
// 🔐 COMPONENTE: Indicador de Fuerza de Contraseña
// ============================================================

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({
  password,
}) => {
  const calculateStrength = useCallback(() => {
    if (!password) return { score: 0, label: "", color: "" };

    const passedRules = PASSWORD_RULES.filter((rule) => rule.test(password));
    const totalStrength = passedRules.reduce(
      (sum, rule) => sum + (rule.strength || 1),
      0
    );
    const maxStrength = PASSWORD_RULES.reduce(
      (sum, rule) => sum + (rule.strength || 1),
      0
    );
    const percentage = (totalStrength / maxStrength) * 100;

    if (percentage < 30)
      return { score: percentage, label: "Débil", color: "bg-red-500" };
    if (percentage < 50)
      return { score: percentage, label: "Regular", color: "bg-amber-500" };
    if (percentage < 75)
      return { score: percentage, label: "Buena", color: "bg-blue-500" };
    if (percentage < 90)
      return { score: percentage, label: "Muy Buena", color: "bg-emerald-500" };
    return { score: percentage, label: "Excelente", color: "bg-green-600" };
  }, [password]);

  const strength = calculateStrength();

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium">Seguridad:</span>
        <span
          className={clsx(
            "font-semibold",
            strength.score < 30 && "text-red-600",
            strength.score >= 30 && strength.score < 50 && "text-amber-600",
            strength.score >= 50 && strength.score < 75 && "text-blue-600",
            strength.score >= 75 && strength.score < 90 && "text-emerald-600",
            strength.score >= 90 && "text-green-600"
          )}
        >
          {strength.label}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full transition-all duration-500 ease-out",
            strength.color
          )}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <div className="space-y-1">
        {PASSWORD_RULES.map((rule, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex items-center gap-2 text-xs transition-colors duration-300",
              rule.test(password) ? "text-emerald-600" : "text-gray-400"
            )}
          >
            <div
              className={clsx(
                "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                rule.test(password) ? "bg-emerald-100" : "bg-gray-100"
              )}
            >
              {rule.test(password) && <CheckCircle2 className="w-3 h-3" />}
            </div>
            <span>{rule.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 🔐 COMPONENTE PRINCIPAL: LOGIN SEGURO (FRONTEND SIN LÓGICA DE SEGURIDAD)
// ============================================================

function LoginMain() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  // Referencias
  const identifierInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Estados principales
  const [phase, setPhase] = useState<AuthPhase>("select");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados UI avanzados
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);

  const [smsSent, setSmsSent] = useState(false);
  const [smsCooldown, setSmsCooldown] = useState<number | null>(null);
  const [smsAttemptsRemaining, setSmsAttemptsRemaining] = useState<
    number | null
  >(null);

  const [isLocked, setIsLocked] = useState(false);
  const [lockSecondsRemaining, setLockSecondsRemaining] = useState<
    number | null
  >(null);
  const [loginAttemptsRemaining, setLoginAttemptsRemaining] = useState<
    number | null
  >(null);

  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [securityDetails, setSecurityDetails] = useState<SecurityDetails | null>(
    null
  );

  // ============================================================
  // 🔐 INICIALIZACIÓN (SOLO UX: BIOMETRÍA + RECORDAR EMAIL)
  // ============================================================

  useEffect(() => {
    const init = async () => {
      // Soporte de biometría (WebAuthn)
      if (typeof window !== "undefined" && (window as any).PublicKeyCredential) {
        try {
          const available =
            await (window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);

          if (available) {
            const userAgent = navigator.userAgent.toLowerCase();
            const isFaceDevice = /iphone|ipad|ipod/.test(userAgent);
            setBiometricType(isFaceDevice ? "face" : "fingerprint");
          }
        } catch (err) {
          console.error("Error checking biometric support:", err);
        }
      }

      // Recordar último email usado (opcional UX)
      try {
        const stored = sessionStorage.getItem("anyssamed:lastIdentifier");
        if (stored) setIdentifier(stored);
      } catch {
        // ignore
      }
    };

    init();
  }, []);

  // ============================================================
  // 🔐 SISTEMA DE NOTIFICACIONES
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
  // 🔐 VALIDACIONES DE INPUT (UX, NO SEGURIDAD REAL)
// ============================================================

  const validateIdentifier = useCallback((value: string): boolean => {
    const cleanValue = value.trim().toLowerCase();

    if (!cleanValue) {
      setIdentifierError("Este campo es requerido");
      return false;
    }

    if (cleanValue.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanValue)) {
        setIdentifierError("Formato de email inválido");
        return false;
      }
    } else {
      if (cleanValue.length < 3) {
        setIdentifierError("Mínimo 3 caracteres");
        return false;
      }
      if (!/^[a-zA-Z0-9._-]+$/.test(cleanValue)) {
        setIdentifierError("Solo letras, números y . _ -");
        return false;
      }
    }

    setIdentifierError(null);
    return true;
  }, []);

  const validatePassword = useCallback((value: string): boolean => {
    if (!value) {
      setPasswordError("La contraseña es requerida");
      return false;
    }

    const passedRules = PASSWORD_RULES.filter((rule) => rule.test(value));
if (passedRules.length < 5) {
      setPasswordError("La contraseña no cumple los requisitos de seguridad");
      return false;
    }

    setPasswordError(null);
    return true;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.getModifierState && e.getModifierState("CapsLock")) {
        setCapsLockOn(true);
      } else {
        setCapsLockOn(false);
      }
    },
    []
  );

  // ============================================================
  // 🔐 LOGIN CON CREDENCIALES (FRONTEND → BACKEND)
// ============================================================

  const handleCredentialsLogin = async () => {
    if (isLocked) {
      addNotification(
        "error",
        "Tu cuenta está bloqueada temporalmente",
        "Cuenta Bloqueada"
      );
      return;
    }

    const isIdentifierValid = validateIdentifier(identifier);
    const isPasswordValid = validatePassword(password);

    if (!isIdentifierValid || !isPasswordValid) {
      addNotification(
        "error",
        "Por favor corrige los errores antes de continuar",
        "Campos Inválidos"
      );
      return;
    }

    const isEmail = identifier.includes("@");
    if (!isEmail) {
      addNotification(
        "error",
        "Introduce tu correo electrónico",
        "Email requerido"
      );
      return;
    }

    const cleanEmail = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          remember,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        if (data?.errorCode === "ACCOUNT_LOCKED") {
          setIsLocked(true);
          if (typeof data.lockSecondsRemaining === "number") {
            setLockSecondsRemaining(data.lockSecondsRemaining);
          }
        }

        if (typeof data.attemptsRemaining === "number") {
          setLoginAttemptsRemaining(data.attemptsRemaining);
        }

        addNotification(
          "error",
          data?.message || "Credenciales incorrectas",
          "Error de Autenticación"
        );
        return;
      }

      // Guardar email para UX (no es seguridad)
      try {
        sessionStorage.setItem("anyssamed:lastIdentifier", cleanEmail);
      } catch {
        // ignore
      }

      // Reset estados de error/bloqueo
      setIsLocked(false);
      setLockSecondsRemaining(null);
      setLoginAttemptsRemaining(null);

      // Flujo según backend
      if (data.requirePasswordChange) {
        setPhase("force_change");
        addNotification(
          "info",
          "Debes actualizar tu contraseña antes de continuar",
          "Actualización requerida"
        );
        return;
      }

      if (data.requireSecurityCheck) {
        setPhase("security_check");
        setSecurityDetails(data.securityDetails || null);
        addNotification(
          "warning",
          "Hemos detectado un acceso inusual",
          "Verificación adicional"
        );
        return;
      }

      if (data.requireMfa) {
        setPhase("mfa");
        addNotification(
          "info",
          "Ingresa tu código de verificación",
          "2FA requerido"
        );
        return;
      }

      // Login completo → redirección
      addNotification(
        "success",
        `Bienvenido, ${data.user?.nombre || cleanEmail}`,
        "Acceso Concedido",
        1200
      );

      setTimeout(() => {
        try {
          if (data.redirectTo) {
            router.replace(data.redirectTo);
          } else if (next) {
            router.replace(next);
          } else {
            router.replace("/dashboard");
          }
        } catch (err) {
          console.error("Error en redirección:", err);
          router.replace("/dashboard");
        }
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      addNotification(
        "error",
        "Error de conexión. Verifica tu internet.",
        "Error al Iniciar Sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔐 SMS (Twilio u otro proveedor) - SOLO ORQUESTACIÓN
  // ============================================================

  const handleSendSMS = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      addNotification(
        "error",
        "Ingresa un número válido con código de país",
        "Número Inválido"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/sms/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
  telefono: phoneNumber,
}),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        if (typeof data.cooldownSeconds === "number") {
          setSmsCooldown(data.cooldownSeconds);
        }
        if (typeof data.attemptsRemaining === "number") {
          setSmsAttemptsRemaining(data.attemptsRemaining);
        }

        addNotification(
          "error",
          data?.message || "No se pudo enviar el SMS",
          "Error de Envío"
        );
        return;
      }

      setSmsSent(true);

      if (typeof data.cooldownSeconds === "number") {
        setSmsCooldown(data.cooldownSeconds);
      }

      if (typeof data.attemptsRemaining === "number") {
        setSmsAttemptsRemaining(data.attemptsRemaining);
      }

      addNotification(
        "success",
        `Código enviado al número indicado`,
        "SMS Enviado",
        6000
      );
    } catch (err: any) {
      addNotification(
        "error",
        err?.message || "Error al enviar SMS",
        "Error de Conexión"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleValidateSMS = async () => {
    if (!smsCode || smsCode.length !== 6) {
      addNotification(
        "error",
        "El código debe tener exactamente 6 dígitos",
        "Código Inválido"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/validate-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
       body: JSON.stringify({
  codigo: smsCode,
  telefono: phoneNumber,
}),

      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        addNotification(
          "error",
          data?.message || "Código incorrecto",
          "Error de Validación"
        );
        setSmsCode("");
        return;
      }

      addNotification(
        "success",
        "SMS verificado correctamente",
        "Autenticación Exitosa",
        2000
      );

      setTimeout(() => {
        router.replace(next || "/dashboard");
      }, 1500);
    } catch (err: any) {
      addNotification(
        "error",
        err?.message || "Error al validar SMS",
        "Error de Conexión"
      );
      setSmsCode("");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔐 MFA CON OTP (TOTP) - SOLO ORQUESTACIÓN
  // ============================================================

  const handleMFAValidation = async () => {
    if (!otp || otp.length !== 6) {
      addNotification(
        "error",
        "El código debe tener exactamente 6 dígitos",
        "Código Inválido"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/validate-mfa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        addNotification(
          "error",
          data?.message || "Código incorrecto",
          "Código OTP Inválido"
        );
        setOtp("");
        return;
      }

      addNotification(
        "success",
        "Código verificado correctamente",
        "Autenticación Exitosa",
        2000
      );

      setTimeout(() => {
        router.replace(next || "/dashboard");
      }, 1500);
    } catch (err: any) {
      addNotification(
        "error",
        err?.message || "Error al validar código",
        "Error de Validación"
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔐 BIOMETRÍA REAL (WebAuthn) - PROTOCOLO ESTÁNDAR
  // ============================================================

  const handleBiometricLogin = async () => {
    if (typeof window === "undefined" || !(window as any).PublicKeyCredential) {
      addNotification(
        "error",
        "Este dispositivo no soporta biometría segura",
        "Biometría no disponible"
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Obtener opciones de autenticación desde el backend
      const optionsRes = await fetch(
        "/api/auth/webauthn/authentication-options",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!optionsRes.ok) {
        throw new Error("No se pudieron obtener las opciones de autenticación");
      }

      const optionsJson = await optionsRes.json();
      const publicKeyOptions = optionsJson.publicKey || optionsJson;

      const publicKey: PublicKeyCredentialRequestOptions = {
        ...publicKeyOptions,
        challenge: base64urlToUint8Array(publicKeyOptions.challenge),
        timeout: publicKeyOptions.timeout ?? 60000,
        allowCredentials: publicKeyOptions.allowCredentials
          ? publicKeyOptions.allowCredentials.map((cred: any) => ({
              ...cred,
              id: base64urlToUint8Array(cred.id),
            }))
          : undefined,
      };

      // 2. Pedir credencial al navegador / sistema
      const credential = (await (navigator as any).credentials.get({
        publicKey,
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Autenticación biométrica cancelada");
      }

      const assertionResponse =
        credential.response as AuthenticatorAssertionResponse;

      const authResponsePayload = {
        id: credential.id,
        type: credential.type,
        rawId: bufferToBase64url(credential.rawId),
        response: {
          authenticatorData: bufferToBase64url(
            assertionResponse.authenticatorData
          ),
          clientDataJSON: bufferToBase64url(assertionResponse.clientDataJSON),
          signature: bufferToBase64url(assertionResponse.signature),
          userHandle: assertionResponse.userHandle
            ? bufferToBase64url(assertionResponse.userHandle)
            : null,
        },
      };

      // 3. Verificar en backend
      const verifyRes = await fetch("/api/auth/webauthn/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          credential: authResponsePayload,
        }),
      });

      const data = await verifyRes.json();

      if (!verifyRes.ok || !data?.ok) {
        throw new Error(data?.message || "Autenticación biométrica fallida");
      }

      addNotification(
        "success",
        `Bienvenido, ${data.user?.nombre || "usuario"}`,
        "Acceso Biométrico Concedido",
        2000
      );

      setTimeout(() => {
        router.replace(next || "/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Biometric login error:", err);

      if (err?.name === "NotAllowedError") {
        addNotification(
          "warning",
          "Autenticación cancelada",
          "Biometría Cancelada"
        );
      } else {
        addNotification(
          "error",
          err?.message || "Error en autenticación biométrica",
          "Error Biométrico"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔐 COUNTDOWNS (SOLO VISUAL: BLOQUEO & SMS)
// ============================================================

  // Bloqueo de cuenta (visual)
  useEffect(() => {
    if (!isLocked || lockSecondsRemaining == null) return;
    if (lockSecondsRemaining <= 0) {
      setIsLocked(false);
      setLockSecondsRemaining(null);
      addNotification(
        "success",
        "Tu cuenta ha sido desbloqueada",
        "Cuenta Desbloqueada"
      );
      return;
    }

    const timer = setTimeout(() => {
      setLockSecondsRemaining((prev) =>
        prev == null ? null : Math.max(prev - 1, 0)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLocked, lockSecondsRemaining, addNotification]);

  // Cooldown SMS (visual)
  useEffect(() => {
    if (smsCooldown == null || smsCooldown <= 0) return;

    const timer = setTimeout(() => {
      setSmsCooldown((prev) =>
        prev == null ? null : Math.max(prev - 1, 0)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [smsCooldown]);

  // ============================================================
  // 🔐 RENDER DEL COMPONENTE
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
            Sistema de Gestión Hospitalaria Seguro
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Certificado ISO 27001</span>
            <span className="text-gray-300">•</span>
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Encriptación E2E</span>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.18)] border border-white/70 ring-1 ring-slate-200/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          {/* Indicador de fase */}
          {phase !== "select" && (
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i === 0 && phase === "credentials" && "bg-blue-500 w-6",
                      i === 1 && phase === "mfa" && "bg-blue-500 w-6",
                      i === 2 &&
                        phase === "security_check" &&
                        "bg-blue-500 w-6",
                      i > 0 && "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium">
                {phase === "credentials" && "Paso 1/3"}
                {phase === "mfa" && "Paso 2/3"}
                {phase === "security_check" && "Paso 3/3"}
              </span>
            </div>
          )}

          {/* FASE: Selección */}
          {phase === "select" && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Bienvenido de vuelta
                </h2>
                <p className="text-sm text-gray-600">
                  Elige tu método de autenticación
                </p>
              </div>

              <div className="space-y-3">
                {/* Biometría */}
                {biometricAvailable && (
                  <button
                    onClick={() => setPhase("biometric")}
                    className="group relative w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    <div className="relative flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {biometricType === "face" ? (
                          <Scan className="w-8 h-8" />
                        ) : (
                          <Fingerprint className="w-8 h-8" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">
                            {biometricType === "face"
                              ? "Reconocimiento Facial"
                              : "Huella Digital"}
                          </h3>
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                        </div>
                        <p className="text-sm text-blue-100">
                          Acceso instantáneo y ultra seguro
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                      RECOMENDADO
                    </div>
                  </button>
                )}

                {/* SMS */}
                <button
                  onClick={() => setPhase("sms")}
                  className="group relative w-full bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-lg mb-1">SMS Real</h3>
                      <p className="text-sm text-emerald-100">
                        Código de verificación a tu celular
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Contraseña */}
                <button
                  onClick={() => setPhase("credentials")}
                  className="group relative w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Lock className="w-8 h-8 text-gray-700" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        Contraseña Segura
                      </h3>
                      <p className="text-sm text-gray-600">
                        Email + contraseña fuerte
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/50">
                <p className="text-center text-sm text-gray-600">
                  ¿Problemas?{" "}
                  <a
                    href="/soporte"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Contacta soporte
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* FASE: Credenciales */}
          {phase === "credentials" && (
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() => {
                  setPhase("select");
                  setIdentifier("");
                  setPassword("");
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Cambiar método</span>
              </button>

              <div className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <input
                      ref={identifierInputRef}
                      type="email"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (identifierError) validateIdentifier(e.target.value);
                      }}
                      onBlur={() => validateIdentifier(identifier)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && password) {
                          handleCredentialsLogin();
                        }
                      }}
                      className={clsx(
                        "w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all outline-none text-gray-900 bg-white",
                        identifierError
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      )}
                      placeholder="tu@email.com"
                      autoComplete="email"
                      disabled={loading}
                    />
                    {identifier && !identifierError && (
                      <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  {identifierError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {identifierError}
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña Segura
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) validatePassword(e.target.value);
                        setShowPasswordStrength(e.target.value.length > 0);
                      }}
                      onBlur={() => {
                        validatePassword(password);
                        setShowPasswordStrength(false);
                      }}
                      onFocus={() =>
                        setShowPasswordStrength(password.length > 0)
                      }
                      onKeyDown={(e) => {
                        handleKeyDown(e);
                        if (e.key === "Enter") handleCredentialsLogin();
                      }}
                      className={clsx(
                        "w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition-all outline-none text-gray-900 bg-white",
                        passwordError
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      )}
                      placeholder="••••••••••••••••"
                      autoComplete="current-password"
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

                  {passwordError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </p>
                  )}

                  {showPasswordStrength && !passwordError && (
                    <div className="mt-3">
                      <PasswordStrengthIndicator password={password} />
                    </div>
                  )}
                </div>

                {/* Opciones */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors select-none">
                      Recordar (30 días)
                    </span>
                  </label>

                  <a
                    href="/recuperar-password"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              {/* Bloqueo */}
              {isLocked && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">
                        Cuenta Bloqueada
                      </h4>
                      <p className="text-sm text-red-700 mb-2">
                        Demasiados intentos fallidos. Espera antes de volver a
                        intentarlo.
                      </p>
                      {lockSecondsRemaining != null && (
                        <div className="flex items-center gap-2 text-sm font-mono text-red-800">
                          <Clock className="w-4 h-4" />
                          <span>
                            {Math.floor(lockSecondsRemaining / 60)}:
                            {String(lockSecondsRemaining % 60).padStart(2, "0")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Intentos */}
              {loginAttemptsRemaining != null && !isLocked && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      Intentos restantes antes del bloqueo:{" "}
                      {loginAttemptsRemaining}
                    </span>
                  </div>
                </div>
              )}

              {/* Botón */}
              <button
                onClick={handleCredentialsLogin}
                disabled={
                  loading ||
                  !identifier ||
                  !password ||
                  !!identifierError ||
                  !!passwordError ||
                  isLocked
                }
                className={clsx(
                  "w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                  loading || isLocked
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                    : identifierError || passwordError
                    ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Iniciar Sesión Segura</span>
                  </>
                )}
              </button>

              {/* Info de seguridad */}
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 space-y-1">
                    <p className="font-semibold">🔒 Protección Avanzada</p>
                    <p>
                      La verificación real de credenciales, bloqueo de cuenta,
                      límites de intentos y análisis de riesgo se realizan en
                      el backend seguro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FASE: MFA (2FA) */}
          {phase === "mfa" && (
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() => {
                  setPhase("credentials");
                  setOtp("");
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Volver</span>
              </button>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <KeyRound className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-1 text-lg">
                      Verificación en Dos Pasos (2FA)
                    </h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Abre Google Authenticator, Authy o Microsoft Authenticator
                      e ingresa el código de 6 dígitos.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <Info className="w-4 h-4" />
                    <span>El código se renueva cada 30 segundos</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Código OTP de 6 Dígitos
                </label>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setOtp(value);
                    if (value.length === 6) {
                      setTimeout(() => handleMFAValidation(), 300);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && otp.length === 6) {
                      handleMFAValidation();
                    }
                  }}
                  className="w-full px-4 py-5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-center text-3xl font-mono tracking-[0.5em] text-gray-900 bg-white"
                  placeholder="000000"
                  autoComplete="one-time-code"
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-center text-gray-500">
                  Se enviará automáticamente al completar los 6 dígitos
                </p>
              </div>

              <button
                onClick={handleMFAValidation}
                disabled={loading || otp.length !== 6}
                className={clsx(
                  "w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                  loading || otp.length !== 6
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
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
                    <span>Verificar y Continuar</span>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  ¿No tienes acceso?{" "}
                  <button
                    onClick={() => setPhase("sms")}
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Usa código SMS
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* FASE: Biométrica (WebAuthn Real) */}
          {phase === "biometric" && (
            <div className="space-y-8 animate-fade-in">
              <button
                onClick={() => setPhase("select")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Cambiar método</span>
              </button>

              <div className="text-center">
                {/* Icono biométrico animado */}
                <div className="relative mx-auto w-40 h-40 mb-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 opacity-20 animate-ping" />
                  <div
                    className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 opacity-30 animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  />

                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {biometricType === "face" ? (
                      <Scan className="w-20 h-20 text-blue-600 animate-pulse" />
                    ) : (
                      <Fingerprint className="w-20 h-20 text-blue-600 animate-pulse" />
                    )}
                  </div>

                  {loading && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      Escaneando...
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {biometricType === "face"
                    ? "Reconocimiento Facial"
                    : "Autenticación por Huella"}
                </h3>

                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                  {loading
                    ? "Verificando tu identidad biométrica..."
                    : biometricType === "face"
                    ? "Mira directamente a la cámara y mantén tu rostro dentro del marco"
                    : "Coloca tu dedo en el sensor biométrico"}
                </p>

                <button
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className={clsx(
                    "inline-flex items-center gap-3 font-bold px-10 py-4 rounded-xl transition-all duration-300 shadow-lg",
                    loading
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-6 h-6" />
                      <span>Iniciar Autenticación</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-emerald-800">
                      <p className="font-semibold mb-1">🔐 Máxima Seguridad</p>
                      <p>
                        Tu biometría NUNCA sale de tu dispositivo. El backend
                        solo recibe claves públicas y firmas según el estándar
                        WebAuthn/FIDO2.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-600">
                  ¿Problemas?{" "}
                  <button
                    onClick={() => setPhase("credentials")}
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Usa contraseña
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* FASE: SMS Real */}
          {phase === "sms" && (
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() => {
                  setPhase("select");
                  setPhoneNumber("");
                  setSmsCode("");
                  setSmsSent(false);
                  setSmsCooldown(null);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Cambiar método</span>
              </button>

              {!smsSent ? (
                <>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900 mb-1 text-lg">
                          Autenticación por SMS Real
                        </h3>
                        <p className="text-sm text-emerald-700 leading-relaxed">
                          Recibirás un código de 6 dígitos en tu celular. El
                          backend gestiona tiempos, intentos y seguridad.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Celular (con código de país)
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <input
                        type="tel"
                        inputMode="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(
                            e.target.value.replace(/[^\d+\s()-]/g, "")
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendSMS();
                        }}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-gray-900 bg-white"
                        placeholder="+56 9 1234 5678"
                        autoComplete="tel"
                        disabled={loading}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Ejemplos: +56 (Chile), +34 (España), +1 (USA)
                    </p>
                  </div>

                  <button
                    onClick={handleSendSMS}
                    disabled={
                      loading ||
                      phoneNumber.length < 10 ||
                      (smsCooldown != null && smsCooldown > 0) ||
                      smsAttemptsRemaining === 0
                    }
                    className={clsx(
                      "w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                      loading ||
                        phoneNumber.length < 10 ||
                        (smsCooldown != null && smsCooldown > 0) ||
                        smsAttemptsRemaining === 0
                        ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Enviando código...</span>
                      </>
                    ) : smsAttemptsRemaining === 0 ? (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        <span>Sin intentos disponibles</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        <span>Enviar Código SMS</span>
                      </>
                    )}
                  </button>

                  {(smsAttemptsRemaining != null ||
                    (smsCooldown != null && smsCooldown > 0)) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="flex flex-col gap-1 text-sm text-amber-800">
                        {smsAttemptsRemaining != null && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                              Intentos SMS restantes: {smsAttemptsRemaining}
                            </span>
                          </div>
                        )}
                        {smsCooldown != null && smsCooldown > 0 && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              Puedes solicitar un nuevo código en {smsCooldown}s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 text-center">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-9 h-9 text-white" />
                    </div>
                    <h4 className="font-bold text-emerald-900 mb-2 text-lg">
                      Código Enviado
                    </h4>
                    <p className="text-sm text-emerald-700 mb-1">
                      Revisa los mensajes en tu celular
                    </p>
                    <p className="text-sm font-mono text-emerald-800">
                      {phoneNumber}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Código de Verificación SMS
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={smsCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setSmsCode(value);
                        if (value.length === 6) {
                          setTimeout(() => handleValidateSMS(), 300);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && smsCode.length === 6) {
                          handleValidateSMS();
                        }
                      }}
                      className="w-full px-4 py-5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-center text-3xl font-mono tracking-[0.5em] text-gray-900 bg-white"
                      placeholder="000000"
                      autoComplete="one-time-code"
                      disabled={loading}
                    />
                    <p className="mt-2 text-xs text-center text-gray-500">
                      ⏱️ El código expira según la política del servidor
                    </p>
                  </div>

                  <button
                    onClick={handleValidateSMS}
                    disabled={loading || smsCode.length !== 6}
                    className={clsx(
                      "w-full font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                      loading || smsCode.length !== 6
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
                        <span>Verificar y Continuar</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      ¿No recibiste el código?
                    </p>
                    <button
                      onClick={() => {
                        setSmsCode("");
                        handleSendSMS();
                      }}
                      disabled={
                        loading ||
                        (smsCooldown != null && smsCooldown > 0) ||
                        smsAttemptsRemaining === 0
                      }
                      className={clsx(
                        "text-sm font-semibold transition-colors",
                        loading ||
                          (smsCooldown != null && smsCooldown > 0) ||
                          smsAttemptsRemaining === 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-emerald-600 hover:text-emerald-700 hover:underline"
                      )}
                    >
                      {smsCooldown != null && smsCooldown > 0 ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Clock className="w-4 h-4" />
                          Reenviar en {smsCooldown}s
                        </span>
                      ) : (
                        "Reenviar código ahora"
                      )}
                    </button>
                  </div>
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">📱 SMS Real Seguro</p>
                    <p>
                      El backend controla el envío de SMS, el límite de intentos
                      y la ventana de tiempo, integrado con Twilio u otro
                      proveedor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FASE: Cambio forzado de contraseña */}
          {phase === "force_change" && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-12 h-12 text-amber-600" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Actualización de Seguridad Requerida
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                  Por políticas de seguridad, debes actualizar tu contraseña
                  antes de continuar. Las reglas de expiración y complejidad se
                  validan en el backend.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-semibold text-amber-900 mb-2">
                  ¿Por qué es necesario?
                </h4>
                <ul className="text-sm text-amber-800 space-y-1 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Política de rotación de contraseña activa.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Cumplimiento de ISO 27001 y HIPAA.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Protección contra accesos no autorizados.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() =>
                  router.push(
                    "/cambiar-password?force=true&next=" +
                      encodeURIComponent(next || "/dashboard")
                  )
                }
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-105 active:scale-95"
              >
                <Lock className="w-5 h-5" />
                <span>Cambiar Contraseña Ahora</span>
              </button>

              <p className="text-xs text-gray-500">
                ⏱️ El proceso toma menos de 2 minutos
              </p>
            </div>
          )}

          {/* FASE: Verificación de seguridad */}
          {phase === "security_check" && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-200 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-12 h-12 text-orange-600" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Verificación de Seguridad Adicional
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                  Detectamos un acceso desde una ubicación, dispositivo o patrón
                  de uso poco habitual. Para proteger tu cuenta, necesitamos una
                  verificación extra.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
                <h4 className="font-semibold text-orange-900 mb-3">
                  Detalles del Acceso:
                </h4>
                <div className="space-y-2 text-sm text-orange-800">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <strong>Ubicación:</strong>{" "}
                      {securityDetails?.location || "Ubicación aproximada"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <strong>Dispositivo:</strong>{" "}
                      {securityDetails?.device || "Dispositivo detectado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <strong>Hora:</strong>{" "}
                      {securityDetails?.time ||
                        new Date().toLocaleTimeString("es-CL")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPhase("mfa")}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                >
                  Verificar con 2FA
                </button>
                <button
                  onClick={() => setPhase("sms")}
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-300 text-gray-900 font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  Verificar con SMS
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Si no reconoces este acceso,{" "}
                <button
                  onClick={() => router.push("/soporte/seguridad")}
                  className="text-red-600 hover:text-red-700 font-semibold hover:underline"
                >
                  repórtalo inmediatamente
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4 animate-fade-in">
          <p className="text-sm text-gray-600">
            ¿Nuevo en AnyssaMed?{" "}
            <a
              href="/registro"
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors"
            >
              Crea tu cuenta gratis
            </a>
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <a href="/terminos" className="hover:text-gray-700 transition-colors">
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
              Cargando AnyssaMed...
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Conexión segura verificada</span>
            </div>
          </div>
        </div>
      }
    >
      <LoginMain />
    </Suspense>
  );
}
