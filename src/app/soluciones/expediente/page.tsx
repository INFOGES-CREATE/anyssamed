"use client";

import React from "react";
import { FileText, Lock, ClipboardCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function ExpedientePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100">
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-5 py-2 rounded-full mb-6 font-semibold">
            <FileText className="w-4 h-4" />
            <span>Expediente Clínico Electrónico</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Seguridad y trazabilidad clínica total
            </span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            Centraliza la información médica de cada paciente con cumplimiento GES, firma digital y auditoría completa.
          </p>

          <a
            href="#contacto"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Solicitar Demostración <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            {
              icon: ClipboardCheck,
              title: "Historial Unificado",
              desc: "Consulta el historial clínico completo del paciente desde cualquier centro o dispositivo.",
            },
            {
              icon: Lock,
              title: "Cumplimiento Normativo",
              desc: "Certificación ISO 27001, GDPR y Ley 20.584 sobre Derechos del Paciente.",
            },
            {
              icon: CheckCircle2,
              title: "Firma Digital Avanzada",
              desc: "Validación médica con autenticación segura y registro de auditoría automática.",
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-3xl p-8 hover:shadow-2xl transition-transform hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6">
                <f.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Expediente Electrónico Integrado</h2>
        <p className="text-lg mb-10 text-indigo-100 max-w-3xl mx-auto">
          Mantén la trazabilidad total de cada atención y mejora la continuidad asistencial.
        </p>
        <a
          href="#contacto"
          className="bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all"
        >
          Agendar Capacitación
        </a>
      </section>
    </div>
  );
}
