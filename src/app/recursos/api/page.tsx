"use client";

import { Code2, CheckSquare, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ApiPage() {
  const endpoints = [
    { m: "POST", p: "/api/auth/login", d: "Inicia sesión con email/usuario + password (+OTP opcional)" },
    { m: "POST", p: "/api/auth/logout", d: "Cierra la sesión actual" },
    { m: "GET",  p: "/api/pacientes", d: "Lista de pacientes (paginada)" },
    { m: "POST", p: "/api/pacientes", d: "Crear paciente" },
  ];
  return (
    <main className="min-h-screen bg-white">
      <section className="pt-28 pb-10 px-4 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Reference</h1>
              <p className="text-gray-600">Endpoints principales y ejemplos</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {endpoints.map((e, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs px-2 py-1 rounded-md bg-gray-900 text-white">{e.m}</span>
                  <code className="font-mono text-sm text-blue-700">{e.p}</code>
                </div>
                <p className="text-gray-700 mt-2">{e.d}</p>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 mt-6 text-indigo-700 font-semibold"
          >
            Ver ejemplos por lenguaje <ArrowRight className="w-4 h-4" />
          </a>

          <div className="mt-10 p-6 rounded-2xl border bg-white">
            <div className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              Autenticación
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
{`// Ejemplo con fetch
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identificador: "demo@demo.cl", password: "123456" })
});
const data = await res.json();`}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
