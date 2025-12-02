// ============================================================
// utils.ts - INFOGES / NEXT.JS 14 / SHADCN / TYPESCRIPT
// Utilidades premium para toda la plataforma
// ============================================================

// ------------------------------------------------------------
// 1. Combinar clases Tailwind (estándar shadcn mejorado)
// ------------------------------------------------------------
export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}

// ------------------------------------------------------------
// 2. Formatos generales
// ------------------------------------------------------------

// Número normal
export function formatNumber(num: number | string): string {
  const n = Number(num);
  if (isNaN(n)) return String(num);
  return new Intl.NumberFormat("es-CL").format(n);
}

// Dinero con CLP
export function formatMoney(num: number | string): string {
  const n = Number(num);
  if (isNaN(n)) return "$0";
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
}

// Fecha básica yyyy-mm-dd → "05/11/2025"
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("es-CL");
}

// Fecha + hora corta
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);

  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Duración → 1h 22m 05s
export function formatDuration(seconds: number): string {
  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  const min = Math.floor((seconds / 60) % 60)
    .toString()
    .padStart(2, "0");
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");

  return hrs !== "00" ? `${hrs}h ${min}m ${sec}s` : `${min}m ${sec}s`;
}

// ------------------------------------------------------------
// 3. Manipulación de texto
// ------------------------------------------------------------

export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, max: number): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function sanitizeString(text: string): string {
  return text.replace(/[<>{}]/g, "");
}

// ------------------------------------------------------------
// 4. Manejo de RUT
// ------------------------------------------------------------

export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function normalizarRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return rut;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  return `${Number(cuerpo).toLocaleString("es-CL")}-${dv}`;
}

export function isRutValido(rut: string): boolean {
  const valor = limpiarRut(rut);
  if (valor.length < 2) return false;

  const dv = valor.slice(-1);
  const cuerpo = valor.slice(0, -1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvFinal =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dvFinal === dv.toUpperCase();
}

// ------------------------------------------------------------
// 5. Async helpers
// ------------------------------------------------------------

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function randomId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timeout: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
) {
  let waiting = false;

  return (...args: Parameters<T>) => {
    if (!waiting) {
      fn(...args);
      waiting = true;
      setTimeout(() => (waiting = false), limit);
    }
  };
}

// ------------------------------------------------------------
// 6. Fechas especiales Chile
// ------------------------------------------------------------

export function esHoy(date: string | Date) {
  const d = new Date(date);
  const hoy = new Date();
  return (
    d.getDate() === hoy.getDate() &&
    d.getMonth() === hoy.getMonth() &&
    d.getFullYear() === hoy.getFullYear()
  );
}

export function esMismoDia(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function formatearFechaCortaCL(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);

  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ------------------------------------------------------------
// 7. Deep merge de objetos (super útil para themes, configs, APIs)
// ------------------------------------------------------------

export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const output: Record<string, any> = { ...target };

  for (const key of Object.keys(source)) {
    const value = (source as Record<string, any>)[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof output[key] === "object" &&
      output[key] !== null
    ) {
      output[key] = deepMerge(
        output[key] as Record<string, any>,
        value as Record<string, any>
      );
    } else {
      output[key] = value;
    }
  }

  return output as T;
}


// ------------------------------------------------------------
// 8. Validación simple de email
// ------------------------------------------------------------
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ------------------------------------------------------------
// 9. Convertir Base64 → Blob (para descargas)
// ------------------------------------------------------------
export function base64ToBlob(base64: string, type: string): Blob {
  const bin = atob(base64);
  const len = bin.length;
  const buffer = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    buffer[i] = bin.charCodeAt(i);
  }

  return new Blob([buffer], { type });
}

// ------------------------------------------------------------
// 10. Generar color random elegante
// ------------------------------------------------------------
export function randomColor(): string {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h}, 70%, 55%)`;
}
