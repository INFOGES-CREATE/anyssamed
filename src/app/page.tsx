"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  FileText,
  Shield,
  Award,
  Star,
  Check,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sparkles,
  Activity,
  Stethoscope,
  ClipboardCheck,
  Brain,
  BarChart3,
  Lock,
  Globe,
  HeartPulse,
  Clock,
  CheckCircle2,
} from "lucide-react";

const MediSuitePremium: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(0);

  const features = [
    {
      icon: Calendar,
      title: "Sistema de Agendamiento Médico",
      description:
        "Gestión profesional de citas con sincronización automática, recordatorios inteligentes y optimización de recursos médicos.",
      details: [
        "Calendario inteligente",
        "Confirmación automática",
        "Lista de espera",
        "Análisis de ocupación",
      ],
      color: "from-blue-600 to-blue-800",
      gradient: "from-blue-50 to-blue-100",
      href: "/soluciones/agenda",
    },
    {
      icon: FileText,
      title: "Expediente Clínico Electrónico",
      description:
        "Historial médico completo con certificaciones digitales, recetas electrónicas y cumplimiento normativo GES.",
      details: [
        "Firma electrónica avanzada",
        "Historial unificado",
        "Recetas digitales",
        "Cumplimiento normativo",
      ],
      color: "from-indigo-600 to-indigo-800",
      gradient: "from-indigo-50 to-indigo-100",
      href: "/soluciones/expediente",
    },
    {
      icon: Users,
      title: "Plataforma de Telemedicina",
      description:
        "Consultas virtuales de alta calidad con herramientas diagnósticas remotas y sala de espera digital.",
      details: [
        "Video HD seguro",
        "Diagnóstico remoto",
        "Prescripción digital",
        "Seguimiento post-consulta",
      ],
      color: "from-cyan-600 to-cyan-800",
      gradient: "from-cyan-50 to-cyan-100",
      href: "/soluciones/telemedicina",
    },
    {
      icon: Brain,
      title: "Inteligencia Artificial Médica",
      description:
        "Asistencia diagnóstica avanzada con detección de interacciones y sugerencias basadas en evidencia.",
      details: [
        "Alertas clínicas",
        "Análisis predictivo",
        "Interacciones medicamentosas",
        "Protocolos actualizados",
      ],
      color: "from-purple-600 to-purple-800",
      gradient: "from-purple-50 to-purple-100",
      href: "/soluciones/ia",
    },
    {
      icon: BarChart3,
      title: "Analítica e Inteligencia de Negocio",
      description:
        "Dashboards ejecutivos con KPIs médicos, predicción de demanda y reportería automatizada.",
      details: [
        "Métricas en tiempo real",
        "Reportes personalizados",
        "Análisis financiero",
        "Proyecciones inteligentes",
      ],
      color: "from-emerald-600 to-emerald-800",
      gradient: "from-emerald-50 to-emerald-100",
      href: "/soluciones/analitica",
    },
    {
      icon: Shield,
      title: "Seguridad y Cumplimiento Total",
      description:
        "Protección de nivel bancario con cumplimiento GDPR, cifrado de extremo a extremo y auditoría completa.",
      details: [
        "Cifrado AES-256",
        "Autenticación 2FA",
        "Backups automáticos",
        "Cumplimiento ISO 27001",
      ],
      color: "from-rose-600 to-rose-800",
      gradient: "from-rose-50 to-rose-100",
      href: "/caracteristicas/seguridad",
    },
  ] as const;

  const plans = [
    {
      name: "Profesional",
      subtitle: "Para consultas independientes",
      price: "69.990",
      period: "/mes",
      description:
        "Solución completa para médicos independientes y consultas privadas",
      features: [
        "1 Profesional médico",
        "Hasta 100 pacientes activos",
        "Agenda médica profesional",
        "Ficha clínica electrónica",
        "Firma digital básica",
        "10 GB almacenamiento seguro",
        "Soporte técnico email",
        "Actualizaciones incluidas",
      ],
      popular: false,
      cta: "Iniciar Prueba Gratuita",
      href: "#contacto",
    },
    {
      name: "Clínica",
      subtitle: "Para centros médicos",
      price: "249.990",
      period: "/mes",
      description:
        "Plataforma integral para centros médicos en crecimiento",
      features: [
        "Hasta 10 profesionales",
        "Pacientes ilimitados",
        "Telemedicina HD incluida",
        "IA médica avanzada",
        "Integración FONASA/ISAPRE",
        "100 GB almacenamiento",
        "Reportería avanzada",
        "API de integración",
        "Soporte prioritario 24/7",
        "Capacitación online",
        "Actualizaciones premium",
      ],
      popular: true,
      cta: "Solicitar Demostración",
      href: "#contacto",
    },
    {
      name: "Enterprise",
      subtitle: "Para grandes organizaciones",
      price: "Personalizado",
      period: "",
      description:
        "Solución empresarial con personalización completa y soporte dedicado",
      features: [
        "Usuarios ilimitados",
        "Multi-centro / Multi-sede",
        "IA médica personalizada",
        "Integración IoT médico",
        "Analítica predictiva avanzada",
        "Almacenamiento ilimitado",
        "API personalizada completa",
        "Gerente de cuenta dedicado",
        "Implementación on-site",
        "Capacitación presencial",
        "SLA 99.99% garantizado",
        "Personalización completa",
      ],
      popular: false,
      cta: "Contactar Ventas",
      href: "#contacto",
    },
  ] as const;

  const testimonials = [
    {
      name: "Dr. Carlos Mendoza Soto",
      role: "Director Médico",
      institution: "Clínica Santa María",
      content:
        "AnyssaMed ha revolucionado completamente nuestra gestión operativa. La eficiencia aumentó un 45% y la satisfacción de nuestros pacientes alcanzó niveles históricos. Una inversión que se paga sola.",
      avatar: "CM",
      rating: 5,
      stats: { efficiency: "+45%", satisfaction: "98%" },
    },
    {
      name: "Dra. Patricia González Ruiz",
      role: "Medicina Familiar",
      institution: "Centro Médico Integral",
      content:
        "La plataforma de telemedicina nos permitió expandir nuestro alcance durante momentos críticos. La calidad del sistema y el soporte técnico son excepcionales. Altamente recomendado.",
      avatar: "PG",
      rating: 5,
      stats: { reach: "+200%", quality: "5/5" },
    },
    {
      name: "Dr. Roberto Silva Campos",
      role: "Gerente General",
      institution: "Red de Salud Austral",
      content:
        "Implementamos AnyssaMed en 15 centros simultáneamente. La integración fue perfecta y ahora tenemos visibilidad total en tiempo real. El ROI superó nuestras expectativas.",
      avatar: "RS",
      rating: 5,
      stats: { centers: "15", roi: "+180%" },
    },
  ] as const;

  const stats = [
    { number: "25,000+", label: "Profesionales de la Salud", icon: Users },
    { number: "800,000+", label: "Pacientes Atendidos", icon: HeartPulse },
    { number: "99.95%", label: "Disponibilidad del Sistema", icon: Activity },
    { number: "24/7", label: "Soporte Especializado", icon: Clock },
  ] as const;

  const certifications = [
    { name: "ISO 27001", icon: Shield },
    { name: "GDPR Compliant", icon: Lock },
    { name: "HIPAA Certified", icon: CheckCircle2 },
    { name: "SOC 2 Type II", icon: Award },
  ] as const;

  // Rotador de testimonios (autoplay)
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
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
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-600/20 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold">
                <Award className="w-4 h-4" />
                <span>Líder en Gestión Médica en Chile</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
                  Excelencia en
                  <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                    Gestión Médica
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Plataforma integral para centros de salud que combina
                  tecnología de vanguardia con estándares médicos de clase
                  mundial. Optimice su operación y eleve la calidad de atención.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#demo"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-semibold"
                >
                  <span>Agendar Demostración</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#casos"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-lg font-semibold"
                >
                  Ver Casos de Éxito
                </a>
              </div>

              {/* Trust */}
              <div className="flex items-center gap-8 pt-6 border-t border-gray-200">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-4 border-white flex items-center justify-center text-white font-bold shadow-lg"
                    >
                      <Users className="w-5 h-5" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">4.9/5</span> de
                    2,400+ profesionales médicos
                  </p>
                </div>
              </div>
            </div>

            {/* Right preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 space-y-6">
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <ClipboardCheck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Próxima Consulta
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        Dr. Juan Pérez
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg">
                    Confirmado
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <Users className="w-8 h-8 text-blue-600 mb-3" />
                    <p className="text-3xl font-bold text-gray-900">2,847</p>
                    <p className="text-sm text-gray-600 font-medium">
                      Pacientes Activos
                    </p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200">
                    <Activity className="w-8 h-8 text-cyan-600 mb-3" />
                    <p className="text-3xl font-bold text-gray-900">99.2%</p>
                    <p className="text-sm text-gray-600 font-medium">
                      Satisfacción
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-6 bg-gray-50 rounded-2xl">
                  {[
                    { icon: Calendar, text: "Agenda sincronizada" },
                    { icon: FileText, text: "Expedientes digitales" },
                    { icon: Shield, text: "Seguridad certificada" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 group"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <item.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {item.text}
                      </span>
                      <Check className="w-5 h-5 text-green-500 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
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
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="características" className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Tecnología de Vanguardia</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Características de
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Nivel Empresarial
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Plataforma integral que integra todas las necesidades de gestión
              médica moderna con los más altos estándares de calidad y seguridad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-2
                ${activeFeature === idx ? "ring-2 ring-blue-500" : ""}`}
                onMouseEnter={() => setActiveFeature(idx)}
                onFocus={() => setActiveFeature(idx)}
                tabIndex={0}
                aria-label={feature.title}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <div className="space-y-2">
                  {feature.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center space-x-2 text-sm text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={feature.href}
                  className="mt-6 inline-flex items-center space-x-2 text-blue-600 font-semibold group-hover:space-x-3 transition-all"
                >
                  <span>Conocer más</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              <span>Planes Empresariales</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Soluciones para Cada
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Necesidad Médica
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Inversión transparente con retorno garantizado. Sin costos ocultos.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
                  plan.popular
                    ? "ring-4 ring-blue-600 shadow-2xl transform lg:scale-110 z-10"
                    : "shadow-lg hover:shadow-xl border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-3 text-sm font-bold uppercase tracking-wider">
                    Más Popular
                  </div>
                )}
                <div className={`p-8 ${plan.popular ? "pt-16" : ""}`}>
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium mb-6">
                      {plan.subtitle}
                    </p>
                    <div className="flex items-end mb-4">
                      {plan.price === "Personalizado" ? (
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                      ) : (
                        <>
                          <span className="text-2xl text-gray-600 font-semibold">
                            $
                          </span>
                          <span className="text-5xl font-bold text-gray-900">
                            {plan.price}
                          </span>
                          <span className="text-gray-600 ml-2">
                            {plan.period}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <a
                    href={plan.href}
                    className={`block text-center w-full py-4 rounded-xl font-bold transition-all duration-200 mb-8 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </a>

                  <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                      Características Incluidas
                    </p>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start space-x-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.popular
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <Check
                            className={`w-4 h-4 ${
                              plan.popular ? "text-white" : "text-gray-700"
                            }`}
                          />
                        </div>
                        <span className="text-gray-700 leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="mt-20 text-center">
            <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider mb-8">
              Certificaciones y Cumplimiento
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow"
                >
                  <cert.icon className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {cert.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-current" />
              <span>Casos de Éxito</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Confianza de los
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Mejores Profesionales
              </span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex text-yellow-400 mb-8" aria-hidden>
                  {[...Array(testimonials[activeTestimonial].rating)].map(
                    (_, i) => (
                      <Star key={i} className="w-7 h-7 fill-current" />
                    )
                  )}
                </div>

                <blockquote className="text-2xl text-gray-700 leading-relaxed mb-10 font-medium">
                  “{testimonials[activeTestimonial].content}”
                </blockquote>

                <div className="flex gap-6 mb-10">
                  {Object.entries(
                    testimonials[activeTestimonial].stats
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="px-6 py-3 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl"
                    >
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {testimonials[activeTestimonial].avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className="text-gray-600 font-medium">
                        {testimonials[activeTestimonial].role}
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonials[activeTestimonial].institution}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestimonial(idx)}
                        className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          idx === activeTestimonial
                            ? "w-12 h-3 bg-gradient-to-r from-blue-600 to-cyan-600"
                            : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Ver testimonio ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
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
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-8">
              <Globe className="w-4 h-4" />
              <span>Implementación Inmediata</span>
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Eleve su Centro Médico
            <span className="block mt-2">al Siguiente Nivel</span>
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Únase a más de 25,000 profesionales de la salud que confían en
            AnyssaMed para optimizar sus operaciones y mejorar la
            experiencia del paciente
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a
              href="#consultoria"
              className="group px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 shadow-2xl transform hover:-translate-y-1 transition-all duration-200 text-lg font-bold flex items-center justify-center space-x-3"
            >
              <span>Agendar Consultoría Gratuita</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#contacto"
              className="px-10 py-5 border-2 border-white text-white rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 text-lg font-bold"
            >
              Hablar con Especialista
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-white/80">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Sin compromiso</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Configuración en 24hrs</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Soporte dedicado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer visual */}
      <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white">
                    AnyssaMed
                  </span>
                  <span className="text-xs text-gray-400 tracking-wider uppercase">
                    Medical Excellence
                  </span>
                </div>
              </div>

              <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
                Plataforma líder en gestión médica integral. Transformando la
                atención en salud con tecnología de vanguardia y estándares de
                clase mundial.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Phone, text: "+56 2 2845 7890" },
                  { icon: Mail, text: "contacto@anyssamed.cl" },
                  {
                    icon: MapPin,
                    text: "Av. Apoquindo 4800, Las Condes, Santiago",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: "Producto",
                links: [
                  { label: "Características", href: "#características" },
                  { label: "Precios", href: "#precios" },
                  { label: "Integraciones", href: "/caracteristicas/integraciones" },
                  { label: "Seguridad", href: "/caracteristicas/seguridad" },
                  { label: "Actualizaciones", href: "/recursos/blog" },
                ],
              },
              {
                title: "Soluciones",
                links: [
                  { label: "Agenda Médica", href: "/soluciones/agenda" },
                  { label: "Expediente Digital", href: "/soluciones/expediente" },
                  { label: "Telemedicina", href: "/soluciones/telemedicina" },
                  { label: "Analítica BI", href: "/soluciones/analitica" },
                ],
              },
              {
                title: "Recursos",
                links: [
                  { label: "Documentación", href: "/recursos/documentacion" },
                  { label: "API", href: "/recursos/api" },
                  { label: "Blog", href: "/recursos/blog" },
                  { label: "Webinars", href: "/recursos/blog" },
                  { label: "Soporte", href: "/recursos/ayuda" },
                ],
              },
            ].map((column, idx) => (
              <div key={idx}>
                <h4 className="text-white font-bold mb-6 text-lg">
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} AnyssaMed. Todos los derechos
              reservados.
            </p>

            <div className="flex items-center space-x-6">
              {[Facebook, Twitter, Instagram, Linkedin].map((Social, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label="Red social"
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:-translate-y-1"
                >
                  <Social className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MediSuitePremium;