"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen, Code2, Newspaper, Video, HelpCircle,
  Award, ArrowRight, Sparkles, Shield, CheckCircle2,
  Users, Activity, Clock, Globe
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RecursosHome: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(0);

  const cards = [
    {
      icon: BookOpen,
      title: "Documentación",
      description:
        "Guías completas, conceptos clave y mejores prácticas para implementar MediSuite Pro.",
      href: "/recursos/documentacion",
      color: "from-blue-600 to-cyan-600",
      gradient: "from-blue-50 to-blue-100",
    },
    {
      icon: Code2,
      title: "API",
      description:
        "Referencia de endpoints, autenticación y ejemplos en múltiples lenguajes.",
      href: "/recursos/api",
      color: "from-indigo-600 to-violet-600",
      gradient: "from-indigo-50 to-indigo-100",
    },
    {
      icon: Newspaper,
      title: "Blog",
      description:
        "Novedades del producto, lanzamientos, casos de uso y consejos del equipo.",
      href: "/recursos/blog",
      color: "from-emerald-600 to-teal-600",
      gradient: "from-emerald-50 to-emerald-100",
    },
    {
      icon: Video,
      title: "Webinars",
      description:
        "Sesiones grabadas, tutoriales paso a paso y masterclasses de implementación.",
      href: "/recursos/webinars",
      color: "from-rose-600 to-pink-600",
      gradient: "from-rose-50 to-rose-100",
    },
    {
      icon: HelpCircle,
      title: "Ayuda & Soporte",
      description:
        "FAQ, resolución de problemas y canales de soporte 24/7.",
      href: "/recursos/ayuda",
      color: "from-amber-600 to-orange-600",
      gradient: "from-amber-50 to-amber-100",
    },
  ] as const;

  const stats = [
    { number: "450+", label: "Artículos Técnicos", icon: BookOpen },
    { number: "120+", label: "Ejemplos de API", icon: Code2 },
    { number: "99.95%", label: "Uptime Docs", icon: Activity },
    { number: "24/7", label: "Soporte", icon: Clock },
  ] as const;

  // hover accesible
  useEffect(() => {
    const t = setTimeout(() => setActiveCard(null), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.08) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-600/20 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Centro de Recursos • MediSuite Pro</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
              Aprende, Integra y
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Despliega en Producción
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Toda la documentación, APIs, guías y soporte en un solo lugar. Diseñado para equipos técnicos y clínicos.
            </p>

            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-blue-600" />
                Seguridad de clase mundial
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Guías validadas por expertos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <s.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-1">
                  {s.number}
                </div>
                <div className="text-blue-100 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Entradas */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              <span>Comienza aquí</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Explora los recursos</h2>
            <p className="text-gray-600 mt-3">
              Selecciona una categoría para ir directo a lo que necesitas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, idx) => (
              <a
                key={idx}
                href={card.href}
                onMouseEnter={() => setActiveCard(idx)}
                className={`group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-2 ${
                  activeCard === idx ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{card.title}</h3>
                <p className="text-gray-600 mb-6">{card.description}</p>
                <span className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  Ir a {card.title} <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
            <Globe className="w-4 h-4" />
            <span>Implementación guiada</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¿Necesitas ayuda experta?
          </h2>
          <p className="text-blue-100 mb-8">
            Nuestro equipo puede acompañarte en todo el onboarding.
          </p>
          <a
            href="/recursos/ayuda"
            className="inline-flex items-center gap-3 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition shadow-2xl"
          >
            Ir a Ayuda & Soporte <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default RecursosHome;
