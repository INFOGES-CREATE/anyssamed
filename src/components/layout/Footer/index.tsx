'use client'

import Link from 'next/link'
import { 
  Stethoscope,
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  Calendar,
  FileText,
  Users,
  Video,
  Brain,
  BarChart3,
  Shield,
  Lock,
  Award,
  CheckCircle2,
  Globe,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Zap,
  Building2,
  Clock,
  ChevronRight,
  ExternalLink,
  Download,
  Smartphone
} from 'lucide-react'

interface FooterLink {
  name: string
  href: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

const footerSections: FooterSection[] = [
  {
    title: 'Soluciones',
    links: [
      { name: 'Agenda Médica', href: '/soluciones/agenda' },
      { name: 'Expediente Digital', href: '/soluciones/expediente' },
      { name: 'Telemedicina', href: '/soluciones/telemedicina' },
      { name: 'Inteligencia Artificial', href: '/soluciones/ia' },
      { name: 'Analítica y BI', href: '/soluciones/analitica' },
      { name: 'Gestión Administrativa', href: '/soluciones/administrativa' },
    ]
  },
  {
    title: 'Características',
    links: [
      { name: 'Seguridad Total', href: '/caracteristicas/seguridad' },
      { name: 'Integraciones', href: '/caracteristicas/integraciones' },
      { name: 'Multi-centro', href: '/caracteristicas/multicentro' },
      { name: 'Reportes Avanzados', href: '/caracteristicas/reportes' },
      { name: 'API Developers', href: '/caracteristicas/api' },
      { name: 'Aplicaciones Móviles', href: '/caracteristicas/mobile' },
    ]
  },
  {
    title: 'Recursos',
    links: [
      { name: 'Documentación', href: '/recursos/documentacion' },
      { name: 'Centro de Ayuda', href: '/recursos/ayuda' },
      { name: 'Casos de Éxito', href: '/recursos/casos-exito' },
      { name: 'Blog Médico', href: '/recursos/blog' },
      { name: 'Webinars', href: '/recursos/webinars' },
      { name: 'Guías y Tutoriales', href: '/recursos/guias' },
    ]
  },
  {
    title: 'Empresa',
    links: [
      { name: 'Sobre Nosotros', href: '/empresa/nosotros' },
      { name: 'Equipo', href: '/empresa/equipo' },
      { name: 'Carreras', href: '/empresa/carreras' },
      { name: 'Prensa', href: '/empresa/prensa' },
      { name: 'Contacto', href: '/empresa/contacto' },
      { name: 'Soporte 24/7', href: '/empresa/soporte' },
    ]
  },
]

const certifications = [
  { name: 'ISO 27001', icon: Shield, description: 'Seguridad de la Información' },
  { name: 'GDPR', icon: Lock, description: 'Protección de Datos' },
  { name: 'HIPAA', icon: CheckCircle2, description: 'Cumplimiento Médico' },
  { name: 'SOC 2', icon: Award, description: 'Auditoría Independiente' },
]

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/anyssamed', color: 'hover:bg-blue-600' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/anyssamed', color: 'hover:bg-sky-500' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/anyssamed', color: 'hover:bg-pink-600' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/anyssamed', color: 'hover:bg-blue-700' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@anyssamed', color: 'hover:bg-red-600' },
]

const contactInfo = [
  { 
    icon: Phone, 
    label: 'Teléfono', 
    value: '+56 9 4930 6385',
    href: 'tel:+569 49306385',
    description: 'Lun - Vie: 8:00 - 20:00'
  },
  { 
    icon: Mail, 
    label: 'Email', 
    value: 'contacto@anyssamed.cl',
    href: 'mailto:contacto@anyssamed.cl',
    description: 'Respuesta en 24 horas'
  },
  { 
    icon: MapPin, 
    label: 'Dirección', 
    value: 'Av. Apoquindo 4800, Piso 12',
    href: 'https://maps.google.com',
    description: 'Santa fe, Curico, Chile',
    external: true
  },
  { 
    icon: Clock, 
    label: 'Soporte', 
    value: 'Disponible 24/7',
    href: '/empresa/soporte',
    description: 'Asistencia técnica continua'
  },
]

const legalLinks = [
  { name: 'Términos y Condiciones', href: '/legal/terminos' },
  { name: 'Política de Privacidad', href: '/legal/privacidad' },
  { name: 'Política de Cookies', href: '/legal/cookies' },
  { name: 'Acuerdo de Nivel de Servicio (SLA)', href: '/legal/sla' },
  { name: 'Cumplimiento Normativo', href: '/legal/cumplimiento' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />

      {/* Newsletter Section */}
      <div className="relative border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                <span>Mantente Actualizado</span>
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">
                Novedades y Actualizaciones
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Recibe las últimas noticias sobre tecnología médica, actualizaciones de producto 
                y mejores prácticas directamente en tu correo.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full px-5 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email profesional"
                    className="w-full px-5 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Especialidad médica"
                    className="flex-1 px-5 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all whitespace-nowrap"
                  >
                    Suscribirse
                  </button>
                </div>
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Al suscribirte aceptas nuestra política de privacidad. Puedes cancelar en cualquier momento.
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Column - Spans 2 columns */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight leading-none">
                  AnyssaMed
                </span>
                <span className="text-xs text-gray-400 tracking-wider uppercase leading-none mt-1">
                  Medical Excellence
                </span>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-8 leading-relaxed">
              Plataforma líder en gestión médica integral para centros de salud modernos. 
              Transformando la atención médica con tecnología de vanguardia y estándares 
              de clase mundial.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mb-8">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* App Downloads */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Descarga la App
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all group border border-gray-700"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Disponible en</div>
                    <div className="text-sm font-bold text-white">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all group border border-gray-700"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Disponible en</div>
                    <div className="text-sm font-bold text-white">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                {section.title}
                <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-600/50 to-transparent" />
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                      <span>{link.name}</span>
                      {link.external && <ExternalLink className="w-3 h-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 pb-16 border-b border-gray-800">
          {contactInfo.map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              target={contact.external ? '_blank' : undefined}
              rel={contact.external ? 'noopener noreferrer' : undefined}
              className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <contact.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    {contact.label}
                  </div>
                  <div className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                    {contact.value}
                  </div>
                  <div className="text-xs text-gray-400">
                    {contact.description}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Certifications */}
        <div className="mb-16 pb-16 border-b border-gray-800">
          <div className="text-center mb-10">
            <h4 className="text-white font-bold text-xl mb-3">
              Certificaciones y Cumplimiento
            </h4>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              Cumplimos con los más altos estándares internacionales de seguridad, 
              privacidad y calidad en el sector salud
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all group text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <cert.icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="font-bold text-white mb-1">{cert.name}</div>
                <div className="text-xs text-gray-400">{cert.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left">
            <p className="text-gray-500 text-sm mb-2">
              © {currentYear} AnyssaMed. Todos los derechos reservados.
            </p>
            <p className="text-gray-600 text-xs">
              Desarrollado con ❤️ para profesionales de la salud en Chile
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link, idx) => (
              <span key={link.name} className="flex items-center gap-2">
                <Link
                  href={link.href}
                  className="text-gray-500 hover:text-blue-400 transition-colors text-xs"
                >
                  {link.name}
                </Link>
                {idx < legalLinks.length - 1 && (
                  <span className="text-gray-700">•</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-12 border-t border-gray-800 flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Sitio Seguro SSL</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span>Verificado y Certificado</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Globe className="w-5 h-5 text-cyan-500" />
            <span>Servicio en Chile</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-5 h-5 text-purple-500" />
            <span>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
