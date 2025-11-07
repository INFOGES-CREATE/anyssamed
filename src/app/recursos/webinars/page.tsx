"use client";

import { Video, Calendar, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function WebinarsPage() {
  const items = [
    { t: "Onboarding Clínico en 30 min", f: "Grabado", href: "#" },
    { t: "MediSuite + IA diagnóstica", f: "Grabado", href: "#" },
    { t: "Optimización de agenda", f: "Próximo • 12/11", href: "#" },
  ];
  return (
    <main className="min-h-screen bg-white">
      <section className="pt-28 pb-10 px-4 bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Webinars</h1>
              <p className="text-gray-600">Tutoriales y sesiones con expertos</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {items.map((w, i) => (
              <a key={i} href={w.href} className="group p-6 rounded-2xl border bg-white hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{w.t}</h3>
                  <Calendar className="w-5 h-5 text-rose-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">{w.f}</p>
                <span className="inline-flex items-center gap-2 mt-3 text-rose-700 font-medium">
                  Ver <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
