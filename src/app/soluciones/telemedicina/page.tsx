"use client";

import React from "react";
import { Video, Globe, HeartPulse, Wifi, ArrowRight } from "lucide-react";

export default function TelemedicinaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-blue-100">
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center space-x-2 bg-cyan-100 text-cyan-700 px-5 py-2 rounded-full mb-6 font-semibold">
            <Video className="w-4 h-4" />
            <span>Telemedicina Profesional</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Conecta pacientes y médicos sin límites
            </span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-10">
            Consultas virtuales seguras, diagnósticos en línea y seguimiento remoto con estándares de calidad hospitalaria.
          </p>

          <a
            href="#contacto"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Probar Teleconsulta <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            {
              icon: Globe,
              title: "Cobertura Global",
              desc: "Atiende pacientes desde cualquier lugar con conexión segura y encriptada.",
            },
            {
              icon: HeartPulse,
              title: "Diagnóstico Remoto",
              desc: "Monitorea signos vitales en tiempo real mediante dispositivos IoT médicos.",
            },
            {
              icon: Wifi,
              title: "Plataforma HD Segura",
              desc: "Videollamadas en alta definición con cifrado extremo a extremo y estabilidad garantizada.",
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-3xl p-8 hover:shadow-2xl transition-transform hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <f.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Telemedicina en Tiempo Real</h2>
        <p className="text-lg mb-10 text-cyan-100 max-w-3xl mx-auto">
          Reduce las brechas de atención médica con tecnología segura y accesible.
        </p>
        <a
          href="#contacto"
          className="bg-white text-cyan-700 font-semibold px-8 py-4 rounded-xl hover:bg-cyan-50 transition-all"
        >
          Solicitar Demo
        </a>
      </section>
    </div>
  );
}
