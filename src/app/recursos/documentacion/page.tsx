"use client";

import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DocumentacionPage() {
  const guides = [
    { t: "Introducción a MediSuite Pro", href: "#" },
    { t: "Modelo de Datos (Firestore)", href: "#" },
    { t: "Autenticación (JWT + Firebase)", href: "#" },
    { t: "Buenas prácticas de seguridad", href: "#" },
    { t: "Deploy en Vercel / Docker", href: "#" },
  ];
  return (
    <main className="min-h-screen bg-white">
      <section className="pt-28 pb-10 px-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentación</h1>
              <p className="text-gray-600">Guías paso a paso y conceptos clave</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {guides.map((g, i) => (
              <a
                key={i}
                href={g.href}
                className="group p-6 rounded-2xl border border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg flex items-start gap-4 transition"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{g.t}</p>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 font-medium">
                    Leer guía <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
