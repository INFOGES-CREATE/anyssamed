"use client";

import React from "react";
import { Brain, AlertTriangle, Activity, Shield, ArrowRight } from "lucide-react";

export default function IaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100">
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-5 py-2 rounded-full mb-6 font-semibold">
            <Brain className="w-4 h-4" />
            <span>Inteligencia Artificial Médica</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Diagnósticos asistidos por IA
            </span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            Apoya la toma de decisiones médicas mediante modelos predictivos, detección de patrones clínicos y recomendaciones basadas en evidencia.
          </p>

          <a
            href="#contacto"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Explorar Casos de IA <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            {
              icon: Activity,
              title: "Análisis Predictivo",
              desc: "Identifica posibles riesgos antes de que ocurran con modelos de predicción clínica.",
            },
            {
              icon: AlertTriangle,
              title: "Alertas Clínicas Inteligentes",
              desc: "Notifica al equipo ante desviaciones de protocolos o interacciones medicamentosas.",
            },
            {
              icon: Shield,
              title: "IA Ética y Segura",
              desc: "Cumple estándares internacionales de bioética y privacidad médica.",
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-3xl p-8 hover:shadow-2xl transition-transform hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <f.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">IA Médica Responsable</h2>
        <p className="text-lg mb-10 text-purple-100 max-w-3xl mx-auto">
          Mejora la precisión diagnóstica y la eficiencia clínica con IA explicable y auditable.
        </p>
        <a
          href="#contacto"
          className="bg-white text-purple-700 font-semibold px-8 py-4 rounded-xl hover:bg-purple-50 transition-all"
        >
          Solicitar Asesoría IA
        </a>
      </section>
    </div>
  );
}
