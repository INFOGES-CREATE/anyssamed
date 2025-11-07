"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Bell,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Mail,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Star,
  Award,
  Video,
  FileText,
  Settings,
  PieChart,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Phone,
  MapPin,
  Stethoscope,
  Home,
  ChevronRight,
} from "lucide-react";

const AgendaMedicaPremium: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);

  const features = [
    {
      icon: Calendar,
      title: "Calendario Inteligente Multi-Vista",
      description:
        "Gestión visual avanzada con vistas día, semana, mes y agenda. Código de colores por especialidad, estado de cita y prioridad.",
      benefits: [
        "Vista diaria con bloques de 15 minutos",
        "Vista semanal con múltiples profesionales",
        "Vista mensual con indicadores de ocupación",
        "Filtros inteligentes por especialidad, estado y profesional",
        "Arrastrar y soltar para reprogramar",
      ],
      color: "from-blue-600 to-blue-800",
    },
    {
      icon: Bell,
      title: "Recordatorios Automatizados Multi-Canal",
      description:
        "Sistema de recordatorios inteligente que reduce ausencias en un 70% mediante comunicación proactiva.",
      benefits: [
        "SMS automáticos 24hrs antes",
        "Email con detalles de la cita",
        "WhatsApp Business API integrado",
        "Llamadas automáticas de confirmación",
        "Recordatorio el día de la cita",
      ],
      color: "from-purple-600 to-purple-800",
    },
    {
      icon: Users,
      title: "Gestión Avanzada de Lista de Espera",
      description:
        "Algoritmo inteligente que optimiza la ocupación y reduce tiempos muertos mediante asignación automática.",
      benefits: [
        "Priorización por urgencia médica",
        "Notificación automática de cupos liberados",
        "Algoritmo de mejor ajuste de horarios",
        "Preferencias de horario del paciente",
        "Reportes de tiempo de espera promedio",
      ],
      color: "from-emerald-600 to-emerald-800",
    },
    {
      icon: Smartphone,
      title: "Portal del Paciente y App Móvil",
      description:
        "Plataforma digital para que pacientes gestionen sus citas 24/7 de forma autónoma y segura.",
      benefits: [
        "Agendamiento online sin llamadas",
        "Cancelación y reprogramación fácil",
        "Historial completo de citas",
        "Documentos médicos descargables",
        "Notificaciones push en tiempo real",
      ],
      color: "from-cyan-600 to-cyan-800",
    },
    {
      icon: BarChart3,
      title: "Analítica de Ocupación y Productividad",
      description:
        "Dashboard ejecutivo con KPIs en tiempo real para optimización de recursos y toma de decisiones.",
      benefits: [
        "Tasa de ocupación por profesional",
        "Tiempo promedio de consulta",
        "Índice de ausencias y cancelaciones",
        "Horas pico y valles de demanda",
        "Proyecciones de ingresos",
      ],
      color: "from-orange-600 to-orange-800",
    },
    {
      icon: Zap,
      title: "Integración Total con Expediente",
      description:
        "Sincronización perfecta con historia clínica para flujo de trabajo sin interrupciones.",
      benefits: [
        "Acceso directo a ficha del paciente",
        "Historial de consultas previas",
        "Alertas de alergias y condiciones",
        "Documentos adjuntos disponibles",
        "Generación automática de atención",
      ],
      color: "from-rose-600 to-rose-800",
    },
  ];

  const demoScreens = [
    {
      title: "Vista de Calendario Semanal",
      description: "Gestión visual de múltiples profesionales simultáneos",
      stats: { ocupacion: "87%", citas: "142", confirmadas: "98%" },
    },
    {
      title: "Panel de Control Ejecutivo",
      description: "Métricas en tiempo real para toma de decisiones",
      stats: { eficiencia: "+45%", satisfaccion: "4.9/5", ahorro: "$8.5M" },
    },
    {
      title: "Portal del Paciente",
      description: "Interfaz intuitiva para agendamiento autónomo",
      stats: { online: "73%", cancelaciones: "-62%", satisfaccion: "98%" },
    },
  ];

  const useCases = [
    {
      icon: Stethoscope,
      title: "Consultas Médicas Especializadas",
      description:
        "Optimización de consultas con múltiples especialidades y subespecialidades.",
      metrics: { ocupacion: "+35%", espera: "-40%", satisfaccion: "4.8/5" },
    },
    {
      icon: FileText,
      title: "Procedimientos y Exámenes",
      description:
        "Coordinación de procedimientos médicos complejos con múltiples recursos.",
      metrics: { eficiencia: "+52%", coordinacion: "+68%", errores: "-87%" },
    },
    {
      icon: Video,
      title: "Telemedicina Integrada",
      description:
        "Agendamiento sincronizado de consultas presenciales y virtuales.",
      metrics: { alcance: "+180%", comodidad: "96%", adopcion: "89%" },
    },
    {
      icon: Users,
      title: "Gestión Multi-Sede",
      description:
        "Coordinación centralizada de múltiples centros médicos y sucursales.",
      metrics: { centralizacion: "100%", visibilidad: "+100%", control: "Total" },
    },
  ];

  const pricingComparison = [
    {
      feature: "Citas perdidas por mes (promedio clínica mediana)",
      sin: "28 citas ($4.2M pérdida)",
      con: "4 citas ($600k pérdida)",
      ahorro: "$3.6M mensuales",
    },
    {
      feature: "Tiempo administrativo en agendamiento",
      sin: "12 hrs/día ($1.8M mes)",
      con: "3 hrs/día ($450k mes)",
      ahorro: "$1.35M mensuales",
    },
    {
      feature: "Tasa de ocupación de consultas",
      sin: "68% (32% desperdicio)",
      con: "92% (8% desperdicio)",
      ahorro: "+24% productividad",
    },
    {
      feature: "Costo total mensual sistema",
      sin: "Pérdidas: $6M+ mes",
      con: "Inversión: $249.990",
      ahorro: "ROI: 2,300%",
    },
  ];

  const integrations = [
    { name: "FONASA", icon: Shield },
    { name: "Isapres", icon: Shield },
    { name: "Google Calendar", icon: Calendar },
    { name: "Outlook", icon: Mail },
    { name: "WhatsApp", icon: MessageSquare },
    { name: "SMS Gateway", icon: Smartphone },
  ];

  const testimonials = [
    {
      name: "Dra. María Elena Torres",
      role: "Directora Médica",
      clinic: "Centro Médico Las Condes",
      content:
        "El sistema de agenda ha transformado nuestra operación. Las ausencias bajaron 70% y la satisfacción de pacientes alcanzó niveles históricos. La inversión se recuperó en 3 meses.",
      avatar: "MT",
      metrics: { ocupacion: "+42%", ausencias: "-70%", roi: "3 meses" },
    },
    {
      name: "Dr. Andrés Valenzuela Soto",
      role: "Gerente Operaciones",
      clinic: "Red Salud Providencia",
      content:
        "Implementamos en 8 centros simultáneamente. La coordinación mejoró dramáticamente y ahora tenemos visibilidad total en tiempo real. Imprescindible para gestión moderna.",
      avatar: "AV",
      metrics: { centros: "8", visibilidad: "+100%", tiempo: "2 semanas" },
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Home className="w-4 h-4 text-gray-400" />
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Soluciones</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-blue-600 font-semibold">
              Agenda Médica
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-600/20 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
              <Calendar className="w-4 h-4" />
              <span>Solución de Agendamiento Inteligente</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              Sistema de Agendamiento
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Médico Premium
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Transforme la gestión de citas médicas con tecnología de
              vanguardia que reduce ausencias en 70%, optimiza ocupación al 92%
              y aumenta satisfacción del paciente al 98%
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#demo"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-semibold"
              >
                <span>Ver Demo Interactiva</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#casos"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-lg font-semibold"
              >
                Casos de Éxito
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, value: "92%", label: "Ocupación Promedio" },
              { icon: UserCheck, value: "-70%", label: "Reducción Ausencias" },
              { icon: Clock, value: "3 min", label: "Tiempo de Agendamiento" },
              { icon: Star, value: "4.9/5", label: "Satisfacción Paciente" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl mb-4 mx-auto">
                  <stat.icon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 text-center">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium text-center">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Características
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                de Clase Mundial
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solución completa con todas las herramientas que necesita para
              gestionar su agenda médica de forma profesional y eficiente
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
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
                <div className="space-y-3">
                  {feature.benefits.map((benefit, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-start space-x-3 group/item"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 leading-relaxed">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Experiencia de Usuario
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Intuitiva y Potente
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interfaz diseñada para médicos, pensada para pacientes
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 shadow-2xl border border-gray-200">
            <div className="grid lg:grid-cols-3 gap-6 mb-12">
              {demoScreens.map((screen, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDemo(idx)}
                  className={`p-6 rounded-2xl transition-all ${
                    selectedDemo === idx
                      ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-xl"
                      : "bg-white text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-lg font-bold mb-2">{screen.title}</div>
                  <div className="text-sm opacity-90">{screen.description}</div>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  {demoScreens[selectedDemo].title}
                </div>
                <div className="text-gray-600">
                  {demoScreens[selectedDemo].description}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {Object.entries(demoScreens[selectedDemo].stats).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100"
                    >
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600 capitalize font-medium">
                        {key}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Vista Multi-Calendario
                      </div>
                      <div className="text-sm text-gray-600">
                        Hasta 12 profesionales simultáneos
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Bell className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Alertas Inteligentes
                      </div>
                      <div className="text-sm text-gray-600">
                        Notificaciones en tiempo real
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Users className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Lista de Espera
                      </div>
                      <div className="text-sm text-gray-600">
                        Gestión automática de cupos
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Analítica Avanzada
                      </div>
                      <div className="text-sm text-gray-600">
                        KPIs en tiempo real
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Casos de Uso
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Comprobados
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {useCase.description}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(useCase.metrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100"
                    >
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {value}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {key}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Retorno de Inversión
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Medible y Garantizado
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Análisis real de impacto económico en clínica mediana (5
              profesionales, 100 citas/día)
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 border border-blue-100">
            <div className="space-y-6">
              {pricingComparison.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="grid lg:grid-cols-4 gap-6 items-center">
                    <div className="lg:col-span-1">
                      <div className="font-bold text-gray-900 text-lg">
                        {item.feature}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                      <div className="text-sm text-red-600 font-semibold mb-1 uppercase">
                        Sin MediSuite
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {item.sin}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="text-sm text-green-600 font-semibold mb-1 uppercase">
                        Con MediSuite
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {item.con}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                      <div className="text-sm text-white/90 font-semibold mb-1 uppercase">
                        Ahorro
                      </div>
                      <div className="text-lg font-bold text-white">
                        {item.ahorro}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-6 rounded-2xl shadow-2xl">
                <Award className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-sm opacity-90">
                    Recuperación de Inversión Promedio
                  </div>
                  <div className="text-3xl font-bold">2.8 Meses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Integraciones
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Nativas
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <integration.icon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="font-semibold text-gray-900">
                  {integration.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="casos" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Casos de
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Éxito Real
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10 shadow-xl border border-gray-200"
              >
                <div className="flex text-yellow-400 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-6 h-6 fill-current" />
                  ))}
                </div>

                <blockquote className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                  "{testimonial.content}"
                </blockquote>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {Object.entries(testimonial.metrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                    >
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                        {value}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {key}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-4 border-t border-gray-300 pt-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.clinic}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
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
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
            Transforme su Gestión de Citas
            <span className="block mt-2">Hoy Mismo</span>
          </h2>

          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Únase a más de 25,000 profesionales que optimizaron su agendamiento
            con MediSuite Pro
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a
              href="#contacto"
              className="group px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 shadow-2xl transform hover:-translate-y-1 transition-all duration-200 text-lg font-bold flex items-center justify-center space-x-3"
            >
              <span>Solicitar Demo Personalizada</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#precio"
              className="px-10 py-5 border-2 border-white text-white rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 text-lg font-bold"
            >
              Ver Planes y Precios
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/80">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Prueba 30 días gratis</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Implementación incluida</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MediSuite Pro</span>
          </div>
          <p className="text-gray-400 mb-6">
            Sistema de Agendamiento Médico Premium
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+56 2 2845 7890</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>contacto@medisuitepro.cl</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-8">
            © 2025 MediSuite Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AgendaMedicaPremium;