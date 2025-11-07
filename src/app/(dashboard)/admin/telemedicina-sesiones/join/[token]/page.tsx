// frontend/src/app/(dashboard)/admin/telemedicina-sesiones/join/[token]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ExternalLink, Copy, AlertTriangle, Video } from "lucide-react";

type Sesion = {
  id_sesion: number;
  id_cita: number | null;
  id_paciente: number;
  id_medico: number;
  proveedor_servicio: string | null;
  estado: string | null;
  fecha_hora_inicio_programada: string;
  fecha_hora_fin_programada: string;
  fecha_hora_inicio_real?: string | null;
  fecha_hora_fin_real?: string | null;

  // Accesos
  token_acceso?: string | null;
  url_sesion?: string | null;         // URL interna (esta misma pantalla)
  external_url?: string | null;       // alias 1
  enlace_externo?: string | null;     // alias 2 (Zoom/Meet/etc)
  join_url?: string | null;           // alias 3 (por si la API lo usa)

  // Datos visibles
  paciente_nombre: string;
  paciente_rut: string | null;
  medico_nombre: string;
  centro_nombre: string | null;
};

export default function AdminJoinPage() {
  const params = useParams();
  const token = (params?.token ?? "") as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token || typeof token !== "string") {
        setError("Token inválido");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // 🔧 Usa la ruta API correcta del backend
        const res = await fetch(`/api/admin/telemedicina/join/${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data?.success || !data?.sesion) {
          throw new Error(data?.error || "Sesión no encontrada");
        }

        const s = data.sesion as Sesion & Record<string, any>;

        // Normaliza enlace externo: acepta múltiples alias y, si url_sesion fuera absoluta, también sirve
        let ext =
          s.external_url ??
          s.enlace_externo ??
          s.join_url ??
          (typeof s.url_sesion === "string" && /^https?:\/\//i.test(s.url_sesion) ? s.url_sesion : null);

        s.external_url = ext ?? null;
        s.enlace_externo = ext ?? null;

        // Asegura token_acceso (si el backend no lo envía, usa el param)
        if (!s.token_acceso) {
          if (typeof s.url_sesion === "string") {
            const parts = s.url_sesion.split("/");
            s.token_acceso = parts[parts.length - 1] || token;
          } else {
            s.token_acceso = token;
          }
        }

        if (mounted) setSesion(s);
      } catch (e: any) {
        if (mounted) setError(e?.message || "No se pudo cargar la sesión");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      alert("Copiado");
    } catch {}
  };

  const entrar = () => {
    const destino =
      sesion?.enlace_externo && /^https?:\/\//i.test(sesion.enlace_externo)
        ? sesion.enlace_externo
        : null;

    if (destino) {
      window.open(destino, "_blank", "noopener,noreferrer");
    } else {
      alert("No hay enlace externo disponible. Verifica la configuración del proveedor o la sala virtual.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando sesión…</span>
        </div>
      </div>
    );
  }

  if (error || !sesion) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 rounded-2xl border bg-amber-50 border-amber-200 text-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div>
            <div className="font-semibold">No pudimos abrir la sesión</div>
            <div className="text-sm mt-1">{error || "Sesión no encontrada."}</div>
            <button
              onClick={() => router.push("/admin/telemedicina-sesiones")}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              Volver al panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fecha = new Date(sesion.fecha_hora_inicio_programada).toLocaleString();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow text-white">
          <Video className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">Unirse a sesión</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 p-5 bg-white">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <Info
            label="Paciente"
            value={`${sesion.paciente_nombre}${sesion.paciente_rut ? " · " + sesion.paciente_rut : ""}`}
          />
          <Info label="Médico" value={sesion.medico_nombre} />
          <Info label="Centro" value={sesion.centro_nombre ?? "—"} />
          <Info label="Proveedor" value={sesion.proveedor_servicio ?? "—"} />
          <Info label="Inicio (prog.)" value={fecha} />
          <Info label="Estado" value={sesion.estado ?? "—"} />
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-3">
          <div className="flex">
            <input
              readOnly
              value={sesion.enlace_externo || ""}
              placeholder="(no provisto)"
              className="flex-1 border rounded-l-lg px-3 py-2"
            />
            <button
              onClick={() => copy(sesion.enlace_externo || "")}
              className="px-3 border rounded-r-lg"
              title="Copiar enlace externo"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex">
            <input
              readOnly
              value={sesion.token_acceso || token}
              className="flex-1 border rounded-l-lg px-3 py-2"
            />
            <button
              onClick={() => copy(sesion.token_acceso || token)}
              className="px-3 border rounded-r-lg"
              title="Copiar token"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={entrar}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <ExternalLink className="w-4 h-4" />
            Entrar a la videollamada
          </button>

          <button
            onClick={() => router.push("/admin/telemedicina-sesiones")}
            className="px-5 py-2.5 rounded-xl border hover:bg-gray-50"
          >
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900 break-all">{value}</div>
    </div>
  );
}
