// frontend/src/app/logout/page.tsx
"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Shield,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Globe,
  Building2,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

export const dynamic = "force-dynamic";

// ============================================================
// 🔐 TIPOS DE DATOS
// ============================================================

type NotificationType = "success" | "error";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

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
      notification.duration || 4000
    );
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl backdrop-blur-xl border animate-slide-in-right",
        notification.type === "success"
          ? "bg-emerald-500/90 border-emerald-400/50 text-white"
          : "bg-red-500/90 border-red-400/50 text-white"
      )}
    >
      {notification.type === "success" ? (
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
      ) : (
        <Shield className="w-5 h-5 flex-shrink-0" />
      )}
      <p className="text-sm font-semibold">{notification.message}</p>
    </div>
  );
};

// ============================================================
// 🔐 COMPONENTE PRINCIPAL: LOGOUT PREMIUM
// ============================================================

function LogoutMain() {
  const router = useRouter();

  // Estados
  const [phase, setPhase] = useState<"confirm" | "processing" | "success">(
    "confirm"
  );
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  // ============================================================
  // 🔐 SISTEMA DE NOTIFICACIONES
  // ============================================================

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration?: number) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ============================================================
  // 🔐 LOGOUT SEGURO
  // ============================================================

  const handleLogout = async () => {
    setLoading(true);
    setPhase("processing");

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        addNotification("error", "Error al cerrar sesión");
        setPhase("confirm");
        setLoading(false);
        return;
      }

      // Limpiar datos locales
      try {
        sessionStorage.clear();
        localStorage.removeItem("anyssamed:userPreferences");
      } catch {
        // ignore
      }

      setPhase("success");
      addNotification("success", "Sesión cerrada correctamente");

      // Countdown antes de redirección
      setCountdownSeconds(2);
    } catch (err: any) {
      console.error("Logout error:", err);
      addNotification("error", "Error de conexión");
      setPhase("confirm");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.replace("/dashboard");
  };

  // ============================================================
  // 🔐 COUNTDOWN PARA REDIRECCIÓN
  // ============================================================

  useEffect(() => {
    if (countdownSeconds == null || countdownSeconds <= 0) {
      if (phase === "success" && countdownSeconds === 0) {
        router.replace("/login");
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdownSeconds((prev) =>
        prev == null ? null : Math.max(prev - 1, 0)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownSeconds, phase, router]);

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

          {/* FASE: Confirmación */}
          {phase === "confirm" && (
            <div className="space-y-8 animate-fade-in">
              {/* Icono animado */}
              <div className="relative mx-auto w-40 h-40">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 opacity-20 animate-ping" />
                <div
                  className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 opacity-30 animate-ping"
                  style={{ animationDelay: "0.5s" }}
                />

                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <LogOut className="w-20 h-20 text-blue-600 animate-pulse" />
                </div>
              </div>

              {/* Contenido */}
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  ¿Cerrar Sesión?
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Tu sesión se cerrará de forma segura
                </p>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className={clsx(
                    "w-full font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                    loading
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-2xl hover:shadow-red-500/30 hover:scale-105 active:scale-95"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Cerrando sesión...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full font-bold py-4 px-6 rounded-2xl transition-all duration-300 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-900 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Volver
                </button>
              </div>

              {/* Info de seguridad */}
              <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold">🔒 Protección Premium</p>
                    <p>Tu sesión será cerrada de forma segura y verificada.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FASE: Procesando */}
          {phase === "processing" && (
            <div className="space-y-12 text-center animate-fade-in">
              {/* Loader premium */}
              <div className="relative mx-auto w-40 h-40">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 opacity-20 animate-ping" />

                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-cyan-600 animate-spin" />
                  </div>
                </div>
              </div>

              {/* Texto */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Cerrando sesión...
                </h2>
                <p className="text-gray-600 text-lg">
                  Por favor espera un momento
                </p>
              </div>
            </div>
          )}

          {/* FASE: Éxito */}
          {phase === "success" && (
            <div className="space-y-12 text-center animate-fade-in">
              {/* Checkmark animado */}
              <div className="relative mx-auto w-40 h-40">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 opacity-20 animate-ping" />

                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-20 h-20 text-emerald-600 animate-scale-in" />
                </div>
              </div>

              {/* Texto */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  ¡Sesión Cerrada!
                </h2>
                <p className="text-gray-600 text-lg">
                  Serás redirigido en breve
                </p>

                {countdownSeconds != null && countdownSeconds > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm font-mono text-blue-600 pt-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>{countdownSeconds}s</span>
                  </div>
                )}
              </div>

              {/* Botón alternativo */}
              <button
                onClick={() => router.replace("/login")}
                className="w-full font-bold py-4 px-6 rounded-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
              >
                Ir al Login Ahora
              </button>

              {/* Info de seguridad */}
              <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold">✅ Sesión Segura</p>
                    <p>Tu sesión ha sido cerrada correctamente.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4 animate-fade-in">
          <p className="text-sm text-gray-600">
            ¿Problemas?{" "}
            <a
              href="/soporte"
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors"
            >
              Contacta soporte
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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
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
      <LogoutMain />
    </Suspense>
  );
}
