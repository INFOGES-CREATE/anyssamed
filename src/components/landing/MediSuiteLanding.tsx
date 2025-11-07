'use client'

import React, { useState, useEffect } from 'react'
import {
  Menu, X, Heart, Users, Calendar, FileText, Shield, Zap, TrendingUp,
  Star, Check, ArrowRight, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react'

const MediSuiteLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Calendar,
      title: 'Agendamiento Inteligente',
      description:
        'Sistema avanzado de reservas multicanal con recordatorios automáticos y gestión flexible de disponibilidad.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Expediente Clínico Digital',
      description:
        'Ficha médica completa con certificados, recetas y gestión de programas GES con firma electrónica.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Telemedicina Integrada',
      description:
        'Consultas virtuales HD con herramientas de diagnóstico remoto y sala de espera virtual.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'IA Médica Avanzada',
      description:
        'Asistente inteligente con detección de interacciones medicamentosas y sugerencias de tratamiento.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: TrendingUp,
      title: 'Analítica y BI',
      description:
        'Dashboards personalizados con KPIs médicos, predicción de demanda y reportes automatizados.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Shield,
      title: 'Seguridad Total',
      description:
        'Cumplimiento GDPR, cifrado de datos, autenticación de dos factores y respaldos automáticos.',
      color: 'from-pink-500 to-rose-500',
    },
  ]

  const plans = [
    {
      name: 'Básico',
      price: '$49',
      period: '/mes',
      description: 'Ideal para consultas independientes',
      features: [
        '1 Usuario médico',
        'Hasta 50 pacientes',
        'Agendamiento básico',
        'Ficha clínica digital',
        'Soporte por email',
        '5GB almacenamiento',
      ],
      popular: false,
      color: 'from-gray-600 to-gray-700',
    },
    {
      name: 'Profesional',
      price: '$149',
      period: '/mes',
      description: 'Para centros médicos en crecimiento',
      features: [
        '5 Usuarios médicos',
        'Pacientes ilimitados',
        'Telemedicina incluida',
        'IA médica básica',
        'Reportes avanzados',
        '50GB almacenamiento',
        'Integración FONASA/ISAPRE',
        'Soporte prioritario 24/7',
      ],
      popular: true,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      name: 'Enterprise',
      price: '$499',
      period: '/mes',
      description: 'Solución completa para grandes centros',
      features: [
        'Usuarios ilimitados',
        'Multi-centro',
        'IA médica completa',
        'IoT e integración dispositivos',
        'Analítica predictiva',
        'Almacenamiento ilimitado',
        'API personalizada',
        'Gerente de cuenta dedicado',
        'Capacitación on-site',
        'SLA 99.9%',
      ],
      popular: false,
      color: 'from-purple-600 to-pink-600',
    },
  ]

  const testimonials = [
    {
      name: 'Dr. Carlos Mendoza',
      role: 'Director Médico - Clínica Santa María',
      content:
        'MediSuite Pro transformó completamente nuestra operación. La eficiencia aumentó un 40% y nuestros pacientes están más satisfechos que nunca.',
      avatar: 'CM',
      rating: 5,
    },
    {
      name: 'Dra. Patricia González',
      role: 'Medicina Familiar - Centro Médico Integral',
      content:
        'La mejor inversión que hemos hecho. El sistema de telemedicina nos permitió llegar a más pacientes durante la pandemia y continuamos usándolo.',
      avatar: 'PG',
      rating: 5,
    },
    {
      name: 'Dr. Roberto Silva',
      role: 'Gerente - Red de Salud del Norte',
      content:
        'Implementamos MediSuite en 12 centros. La integración fue perfecta y ahora tenemos visibilidad total de todas nuestras operaciones.',
      avatar: 'RS',
      rating: 5,
    },
  ]

  const stats = [
    { number: '15,000+', label: 'Profesionales activos' },
    { number: '500,000+', label: 'Pacientes atendidos' },
    { number: '99.9%', label: 'Uptime garantizado' },
    { number: '24/7', label: 'Soporte disponible' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* ===================== NAVBAR ===================== */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-lg py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                MediSuite Pro
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Características</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition">Precios</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition">Testimonios</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contacto</a>
              <a href="/login" className="px-4 py-2 text-blue-600 hover:text-blue-700 transition">Iniciar Sesión</a>
              <a href="/register" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition">
                Demo Gratis
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-blue-600 transition">Características</a>
              <a href="#pricing" className="block text-gray-700 hover:text-blue-600 transition">Precios</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-blue-600 transition">Testimonios</a>
              <a href="#contact" className="block text-gray-700 hover:text-blue-600 transition">Contacto</a>
              <a href="/login" className="w-full block text-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg">Iniciar Sesión</a>
              <a href="/register" className="w-full block text-center px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg">Demo Gratis</a>
            </div>
          )}
        </div>
      </nav>

      {/* ===================== HERO ===================== */}
      <section className="pt-32 pb-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Transforma
          </span>{' '}
          tu Centro Médico <br /> al Futuro
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Gestión integral con IA, telemedicina y analítica avanzada.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/register" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition text-lg font-semibold flex items-center gap-2">
            Comenzar Ahora <ArrowRight className="w-5 h-5" />
          </a>
          <a href="#features" className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition text-lg font-semibold">
            Ver Demo
          </a>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-bold">{stat.number}</div>
              <div className="text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default MediSuiteLanding
