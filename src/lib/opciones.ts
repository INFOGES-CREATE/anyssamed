// frontend/src/lib/opciones.ts
export type Opcion = { value: string | number; label: string; [k: string]: any };

const BASE = "/api/admin/pacientes/opciones";

export async function fetchPaises(): Promise<{paises: Opcion[]}> {
  const r = await fetch(`${BASE}`, { cache: "no-store" });
  const j = await r.json();
  return { paises: j?.geo?.paises ?? j?.paises ?? [] };
}

export async function fetchRegiones(params: { pais?: string | number } = {}): Promise<{regiones: Opcion[]}> {
  const q = new URLSearchParams();
  if (params.pais !== undefined && params.pais !== null && params.pais !== "")
    q.set("pais", String(params.pais));
  const r = await fetch(`${BASE}${q.size ? `?${q.toString()}` : ""}`, { cache: "no-store" });
  const j = await r.json();
  return { regiones: j?.geo?.regiones ?? j?.regiones ?? [] };
}

export async function fetchComunas(params: { region: string | number; pais?: string | number }): Promise<{comunas: Opcion[]}> {
  const q = new URLSearchParams();
  // Enviamos region como la app lo use: valor, código o id. El backend ya normaliza.
  q.set("region", String(params.region));
  if (params.pais !== undefined && params.pais !== null && params.pais !== "")
    q.set("pais", String(params.pais)); // útil si tus tablas de regiones/comunas piden país
  const r = await fetch(`${BASE}?${q.toString()}`, { cache: "no-store" });
  const j = await r.json();
  return { comunas: j?.geo?.comunas ?? j?.comunas ?? [] };
}
