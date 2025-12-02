// app/api/geo/paises/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

// =======================================
// Forzamos Node.js y respuesta dinámica
// =======================================
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =========================
// Sesión
// =========================
const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";

  if (cookieHeader) {
    const cookies = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .reduce((acc, c) => {
        const [k, ...rest] = c.split("=");
        acc[k] = rest.join("=");
        return acc;
      }, {} as Record<string, string>);

    for (const name of SESSION_COOKIE_CANDIDATES) {
      if (cookies[name]) {
        return decodeURIComponent(cookies[name]);
      }
    }
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

async function validarSesion(
  request: NextRequest
): Promise<number | null> {
  const token = getSessionToken(request);
  if (!token) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND u.estado = 'activo'
      LIMIT 1
    `,
    [token]
  );

  if (rows.length === 0) return null;

  await pool.query(
    `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
    [token]
  );

  return rows[0].id_usuario as number;
}

// =======================================
// Helper para armar el phone_code (+56…)
// =======================================
function getPhoneCode(idd: any): string | null {
  if (!idd || !idd.root) return null;
  if (Array.isArray(idd.suffixes) && idd.suffixes.length > 0) {
    return `${idd.root}${idd.suffixes[0]}`; // ej: +5 y 6 => +56
  }
  return idd.root;
}

// Tipado mínimo de lo que usamos de RestCountries
interface RestCountry {
  name?: {
    common?: string;
    official?: string;
  };
  translations?: {
    spa?: {
      common?: string;
    };
  };
  cca2?: string;
  cca3?: string;
  idd?: {
    root?: string;
    suffixes?: string[];
  };
  region?: string;
  capital?: string[] | string;
  currencies?: Record<
    string,
    {
      name?: string;
      symbol?: string;
    }
  >;
  languages?: Record<string, string>;
  tld?: string[];
  flags?: {
    svg?: string;
    png?: string;
  };
}

// Tipo de país que devolvemos a frontend
interface PaisResponse {
  id_pais: string; // ISO2
  nombre: string;
  codigo_iso2: string | null;
  codigo_iso3: string | null;
  phone_code: string | null;
  capital: string | null;
  continente: string | null;
  moneda: string | null;
  codigo_moneda: string | null;
  idioma_oficial: string | null;
  dominio_internet: string | null;
  bandera_url: string | null;
  prioridad: number;
  activo: number;
}

// =======================================
// GET: TODOS LOS PAÍSES DEL MUNDO
// Chile primero, luego el resto alfabético
// =======================================
export async function GET(request: NextRequest) {
  try {
    const idUsuario = await validarSesion(request);
    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    console.log("🌍 GET /api/geo/paises -> RestCountries");

    const apiUrl =
      "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,idd,region,capital,currencies,languages,tld,flags";

    const res = await fetch(apiUrl, { cache: "no-store" });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(
        "❌ Error al llamar a RestCountries:",
        res.status,
        txt
      );
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener países desde RestCountries",
        },
        { status: 502 }
      );
    }

    const raw = (await res.json()) as RestCountry[];

    const paises: PaisResponse[] = raw
      .map((p) => {
        const nombre =
          p.translations?.spa?.common ||
          p.name?.common ||
          p.name?.official ||
          "";

        if (!nombre) return null;

        const phone_code = getPhoneCode(p.idd);

        const primeraMoneda = p.currencies
          ? Object.entries(p.currencies)[0]
          : null;
        const monedaNombre = primeraMoneda
          ? (primeraMoneda[1] as any).name ?? null
          : null;
        const monedaCodigo = primeraMoneda
          ? (primeraMoneda[0] as string)
          : null;

        const primerIdioma = p.languages
          ? (Object.values(p.languages)[0] as string)
          : null;

        const dominio =
          Array.isArray(p.tld) && p.tld.length > 0 ? p.tld[0] : null;

        const bandera_url = p.flags?.svg || p.flags?.png || null;

        const codigoIso2 = p.cca2 ?? null;
        const codigoIso3 = p.cca3 ?? null;

        return {
          id_pais: codigoIso2 ?? nombre, // usamos ISO2 como ID; fallback al nombre si faltara
          nombre,
          codigo_iso2: codigoIso2,
          codigo_iso3: codigoIso3,
          phone_code,
          capital: Array.isArray(p.capital)
            ? p.capital[0] ?? null
            : p.capital ?? null,
          continente: p.region ?? null,
          moneda: monedaNombre,
          codigo_moneda: monedaCodigo,
          idioma_oficial: primerIdioma,
          dominio_internet: dominio,
          bandera_url,
          prioridad: 100,
          activo: 1,
        } as PaisResponse;
      })
      .filter((p): p is PaisResponse => !!p)
      .sort((a, b) => {
        const isChileA =
          a.codigo_iso2 === "CL" ||
          a.nombre.toLowerCase() === "chile";
        const isChileB =
          b.codigo_iso2 === "CL" ||
          b.nombre.toLowerCase() === "chile";

        // Chile siempre primero
        if (isChileA && !isChileB) return -1;
        if (!isChileA && isChileB) return 1;

        // El resto orden alfabético por nombre (en español)
        return a.nombre.localeCompare(b.nombre, "es");
      });

    console.log(
      "✅ Países cargados desde RestCountries:",
      paises.length
    );

    return NextResponse.json(
      {
        success: true,
        paises,
        total: paises.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ GET /api/geo/paises (RestCountries):", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
