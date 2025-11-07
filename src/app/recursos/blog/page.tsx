"use client";

import { Newspaper, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function BlogPage() {
  const posts = [
    { t: "Lanzamiento: Integración con Firestore", d: "Cómo migrar tu proyecto a la nueva capa de datos.", href: "#" },
    { t: "Mejoras de seguridad 2025", d: "Nuevos controles y auditorías automáticas.", href: "#" },
    { t: "Guía de rendimiento en Next.js 14", d: "Patrones para apps con App Router.", href: "#" },
  ];
  return (
    <main className="min-h-screen bg-white">
      <section className="pt-28 pb-10 px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
              <Newspaper className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
              <p className="text-gray-600">Noticias, lanzamientos y aprendizajes</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <a key={i} href={p.href} className="group p-6 rounded-2xl border bg-white hover:shadow-lg transition">
                <h3 className="font-bold text-gray-900">{p.t}</h3>
                <p className="text-gray-600 mt-2">{p.d}</p>
                <span className="inline-flex items-center gap-2 mt-3 text-emerald-700 font-medium">
                  Leer más <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
