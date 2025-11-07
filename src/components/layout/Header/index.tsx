'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  Heart, 
  ChevronDown,
  User,
  FileText,
  Calendar,
  Settings,
  LogIn,
  UserPlus,
  BookOpen,
  Sparkles,
  Stethoscope,
  Activity,
  BarChart3,
  Shield,
  Users,
  Video,
  Brain,
  ClipboardCheck,
  Zap,
  Building2,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react'

interface DropdownItem {
  name: string
  href: string
  icon: any
  description: string
}

interface NavItem {
  name: string
  href?: string
  icon?: any
  dropdown?: DropdownItem[]
}

const navigation: NavItem[] = [
  {
    name: 'Soluciones',
    dropdown: [
      { name: 'Agenda Médica', href: '/soluciones/agenda', icon: Calendar, description: 'Gestión inteligente de citas y reservas' },
      { name: 'Expediente Digital', href: '/soluciones/expediente', icon: FileText, description: 'Historias clínicas electrónicas completas' },
      { name: 'Telemedicina', href: '/soluciones/telemedicina', icon: Video, description: 'Consultas virtuales de alta calidad' },
      { name: 'Inteligencia Artificial', href: '/soluciones/ia', icon: Brain, description: 'Asistencia diagnóstica avanzada' },
      { name: 'Analítica y BI', href: '/soluciones/analitica', icon: BarChart3, description: 'Business Intelligence médico' },
      { name: 'Gestión Administrativa', href: '/soluciones/administrativa', icon: ClipboardCheck, description: 'Facturación y gestión financiera' },
    ]
  },
  {
    name: 'Características',
    dropdown: [
      { name: 'Seguridad Total', href: '/caracteristicas/seguridad', icon: Shield, description: 'Certificaciones ISO 27001, GDPR, HIPAA' },
      { name: 'Integraciones', href: '/caracteristicas/integraciones', icon: Zap, description: 'Conexión con sistemas externos' },
      { name: 'Multi-centro', href: '/caracteristicas/multicentro', icon: Building2, description: 'Gestión de múltiples sedes' },
      { name: 'Reportes Avanzados', href: '/caracteristicas/reportes', icon: BarChart3, description: 'Dashboards ejecutivos personalizados' },
    ]
  },
  { name: 'Precios', href: '/#precios' },
  {
    name: 'Recursos',
    dropdown: [
      { name: 'Documentación', href: '/recursos/documentacion', icon: BookOpen, description: 'Guías completas y tutoriales' },
      { name: 'API Developers', href: '/recursos/api', icon: Settings, description: 'Documentación técnica para desarrolladores' },
      { name: 'Casos de Éxito', href: '/recursos/casos-exito', icon: Sparkles, description: 'Historias de implementación exitosa' },
      { name: 'Blog', href: '/recursos/blog', icon: FileText, description: 'Artículos y novedades del sector' },
      { name: 'Centro de Ayuda', href: '/recursos/ayuda', icon: HelpCircle, description: 'Preguntas frecuentes y soporte' },
    ]
  },
  {
    name: 'Empresa',
    dropdown: [
      { name: 'Sobre Nosotros', href: '/empresa/nosotros', icon: Users, description: 'Conoce nuestro equipo y misión' },
      { name: 'Contacto', href: '/empresa/contacto', icon: MessageSquare, description: 'Habla con nuestro equipo' },
      { name: 'Soporte', href: '/empresa/soporte', icon: Phone, description: 'Asistencia técnica 24/7' },
    ]
  },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  // Timer para hover-intent (cierre retardado)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])
  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 160) // retardo sutil
  }, [clearCloseTimer])

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú móvil y dropdown al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen])

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Evitar hover en dispositivos táctiles
  const isHoverable = typeof window !== 'undefined' && matchMedia('(hover: hover)').matches

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/98 backdrop-blur-xl shadow-lg border-b border-gray-100' 
            : 'bg-gradient-to-b from-white/98 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo Premium */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 group z-50"
              aria-label="AnyssaMed - Inicio"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                  AnyssaMed
                </span>
                <span className="text-xs text-gray-500 tracking-wider uppercase leading-none">
                  Medical Excellence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => { if (isHoverable) { clearCloseTimer(); setOpenDropdown(item.name) } }}
                  onMouseLeave={() => { if (isHoverable) scheduleClose() }}
                >
                  {item.dropdown ? (
                    <div className="relative">
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={openDropdown === item.name}
                        aria-controls={`menu-${item.name}`}
                        onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                        className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isScrolled 
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                            : 'text-gray-800 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {item.name}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.name ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {/* Dropdown + puente anti-gap */}
                      {openDropdown === item.name && (
                        <>
                          {/* Bridge para evitar gaps entre botón y menú */}
                          <div className="absolute left-0 right-0 top-full h-3 -mt-1" />

                          <div
                            id={`menu-${item.name}`}
                            role="menu"
                            onMouseEnter={clearCloseTimer}
                            onMouseLeave={scheduleClose}
                            className="absolute top-full left-0 mt-3 w-80 animate-fade-in z-50"
                          >
                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                              <div className="p-2">
                                {item.dropdown.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={() => setOpenDropdown(null)}
                                    className="flex items-start gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 group"
                                  >
                                    <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
                                      <subItem.icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                                        {subItem.name}
                                      </div>
                                      <div className="text-xs text-gray-600 leading-relaxed">
                                        {subItem.description}
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                              <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 px-4 py-3 border-t border-gray-100">
                                <Link 
                                  href={item.name === 'Soluciones' ? '/soluciones' : item.name === 'Recursos' ? '/recursos' : '/empresa'} 
                                  onClick={() => setOpenDropdown(null)}
                                  className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 group"
                                >
                                  <span>Ver todo en {item.name}</span>
                                  <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive(item.href!)
                          ? 'text-blue-600 bg-blue-50'
                          : isScrolled 
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                            : 'text-gray-800 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Buttons Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                <span>Solicitar Demo</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors z-50"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-40 lg:hidden transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } shadow-2xl`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">AnyssaMed</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Medical Excellence</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto p-6 space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <details open={openDropdown === item.name} onToggle={(e) => {
                      const el = e.currentTarget as HTMLDetailsElement
                      setOpenDropdown(el.open ? item.name : null)
                    }}>
                      <summary className="list-none w-full flex items-center justify-between px-4 py-3.5 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <span>{item.name}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${
                          openDropdown === item.name ? 'rotate-180' : ''
                        }`} />
                      </summary>
                      <div className="mt-2 ml-4 space-y-1 animate-fade-in">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all group"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <subItem.icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm mb-0.5 group-hover:text-blue-600 transition-colors">
                                {subItem.name}
                              </div>
                              <div className="text-xs text-gray-600 leading-relaxed">
                                {subItem.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all ${
                        isActive(item.href!)
                          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div className="p-6 border-t border-gray-200 space-y-3 bg-gradient-to-b from-white to-gray-50">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 text-gray-700 font-bold border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <LogIn className="w-5 h-5" />
                <span>Ingresar a mi Cuenta</span>
              </Link>
              <Link
                href="/demo"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Solicitar Demostración</span>
              </Link>
              
              {/* Contact Info */}
              <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>+56 2 2845 7890</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>contacto@anyssamed.cl</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para no tapar el contenido */}
      <div className="h-20" />

      {/* Animaciones */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </>
  )
}
