"use client";

import { useState } from "react";
import { Fingerprint, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function BiometriaPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleRegisterBiometric = async () => {
    if (typeof window === "undefined" || !window.PublicKeyCredential) {
      setStatus("error");
      setMessage("Este navegador no soporta autenticación biométrica.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage(null);

    try {
      // 1) Pedir opciones de registro al backend
      const resOptions = await fetch(
        "/api/auth/webauthn/registration-options",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!resOptions.ok) {
        const err = await resOptions.json().catch(() => null);
        throw new Error(err?.error || "No se pudo obtener las opciones.");
      }

      const json = await resOptions.json();
      const publicKeyOptions = json.publicKey || json;

      // Decode base64url -> ArrayBuffer
      const base64urlToUint8Array = (base64url: string) => {
        let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
        const pad = base64.length % 4;
        if (pad) base64 += "=".repeat(4 - pad);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      };

      const publicKey: PublicKeyCredentialCreationOptions = {
        ...publicKeyOptions,
        challenge: base64urlToUint8Array(publicKeyOptions.challenge),
        user: {
          ...publicKeyOptions.user,
          id: base64urlToUint8Array(publicKeyOptions.user.id),
        },
      };

      if (publicKeyOptions.excludeCredentials) {
        publicKey.excludeCredentials = publicKeyOptions.excludeCredentials.map(
          (cred: any) => ({
            ...cred,
            id: base64urlToUint8Array(cred.id),
          })
        );
      }

      // 2) Abrir diálogo de huella / FaceID
      const credential = (await navigator.credentials.create({
        publicKey,
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("El registro fue cancelado.");
      }

      const bufferToBase64url = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/g, "");
      };

      const attestationResponse = credential.response as AuthenticatorAttestationResponse;

      const credentialPayload = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64url(attestationResponse.clientDataJSON),
          attestationObject: bufferToBase64url(
            attestationResponse.attestationObject
          ),
        },
        clientExtensionResults:
          typeof (credential as any).getClientExtensionResults === "function"
            ? (credential as any).getClientExtensionResults()
            : {},
      };

      // 3) Enviar al backend para verificar y guardar
      const resVerify = await fetch("/api/auth/webauthn/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: credentialPayload }),
      });

      const verifyJson = await resVerify.json();

      if (!resVerify.ok || !verifyJson?.ok) {
        throw new Error(verifyJson?.error || "No se pudo registrar la huella.");
      }

      setStatus("ok");
      setMessage("Huella registrada correctamente. Ya puedes usar inicio de sesión biométrico.");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err?.message || "Error al registrar la huella.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
            <Fingerprint className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">
              Activar inicio de sesión con huella
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Registra este dispositivo para que el médico pueda entrar con biometría.
            </p>
          </div>
        </div>

        {status !== "idle" && message && (
          <div
            className={
              status === "ok"
                ? "mb-4 flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2"
                : "mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
            }
          >
            {status === "ok" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5" />
            )}
            <span>{message}</span>
          </div>
        )}

        <button
          onClick={handleRegisterBiometric}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Registrando huella...</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5" />
              <span>Registrar este dispositivo</span>
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-slate-500 text-center">
          La huella nunca sale del dispositivo, solo se guarda una clave pública para verificarte.
        </p>
      </div>
    </div>
  );
}
