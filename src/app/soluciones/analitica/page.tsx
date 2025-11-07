"use client";

import React from "react";
import { BarChart3, PieChart, Database, TrendingUp, ArrowRight } from "lucide-react";

export default function AnaliticaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-100">
      {/* Hero */}
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full mb-6 font-semibold">
            <BarChart3 className="w-4 h-4" />
            <span>Analítica e Inteligencia de Negocio</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Datos que impulsan decisiones
            </span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            Monitorea tus indicadores clínicos, financieros y operativos en tiempo real con dashboards dinámicos y reportes predictivos.
          </p>

          <a
            href="#contacto"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Ver Demostración <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            {
              icon: TrendingUp,
              title: "Análisis Predictivo",
              desc: "Identifica tendencias clínicas y anticipa la demanda de servicios con IA integrada.",
            },
            {
              icon: PieChart,
              title: "Dashboard Personalizado",
              desc: "Configura paneles a la medida de tu rol: dirección, operaciones o clínica.",
            },
            {
              icon: Database,
              title: "Reportes Automatizados",
              desc: "Exporta KPIs a PDF, Excel o Power BI sin esfuerzo.",
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-8 hover:shadow-2xl transition-transform hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <f.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Conecta tus Datos, Potencia tus Decisiones</h2>
        <p className="text-lg mb-10 text-emerald-100 max-w-3xl mx-auto">
          Transforma métricas en inteligencia real. Accede a reportes automáticos con un solo clic.
        </p>
        <a
          href="#contacto"
          className="bg-white text-emerald-700 font-semibold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all"
        >
          Agendar Asesoría en BI
        </a>
      </section>
    </div>
  );
}
