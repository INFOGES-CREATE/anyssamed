// ============================================================
// 🔐 Middleware de Autenticación - MediSuite Pro (Versión estable)
// ============================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🧭 Rutas protegidas
  const isPrivateRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tecnico") ||
    pathname.startsWith("/medico") ||
    pathname.startsWith("/secretaria");

  // Leer cookie
  const token = req.cookies.get("session")?.value;

  // Si está en /login y tiene sesión activa → redirigir al panel correspondiente
  if (pathname === "/login" && token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const rol = decoded.rol?.toLowerCase();

      // 🔁 Redirección dinámica según rol
      let redirectPath = "/dashboard";
      if (rol.includes("superadmin") || rol.includes("superadministrador")) {
        redirectPath = "/admin";
      } else if (rol.includes("tecnico")) {
        redirectPath = "/tecnico";
      } else if (rol.includes("medico")) {
        redirectPath = "/medico";
      } else if (rol.includes("secretaria")) {
        redirectPath = "/secretaria";
      }

      const redirectUrl = new URL(redirectPath, req.url);
      return NextResponse.redirect(redirectUrl);
    } catch {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("session");
      return res;
    }
  }

  // Si no tiene token e intenta acceder a ruta protegida → login
  if (isPrivateRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/tecnico/:path*",
    "/medico/:path*",
    "/secretaria/:path*",
    "/api/admin/:path*",      // 🔥 protege APIs de admin
    "/api/tecnico/:path*",    // opcional
    "/api/medico/:path*",     // opcional
    "/api/secretaria/:path*", // opcional
    "/login",
  ],
};
