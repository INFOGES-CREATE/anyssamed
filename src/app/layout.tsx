import '../styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import MarketingChrome from '../components/layout/MarketingChrome'

// ===============================
// 🔹 FUENTES
// ===============================
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})
const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

// ===============================
// 🔹 METADATOS
// ===============================
export const metadata: Metadata = {
  title: {
    default: 'MediSuite Pro - Sistema de Gestión Médica Premium | Líder en Chile',
    template: '%s | MediSuite Pro',
  },
  description:
    'Plataforma integral de gestión médica con IA, telemedicina y analítica avanzada. Optimice su centro de salud con la tecnología más avanzada de Chile. +25,000 profesionales confían en nosotros.',
  keywords: [
    'gestión médica',
    'software médico Chile',
    'telemedicina',
    'expediente clínico electrónico',
    'agenda médica digital',
    'centro de salud',
    'IA médica',
    'FONASA',
    'ISAPRE',
    'sistema hospitalario',
    'clínica privada',
    'consultorio médico',
    'historia clínica digital',
    'recetas electrónicas',
    'certificados médicos digitales',
  ],
  authors: [{ name: 'MediSuite Pro Team', url: 'https://medisuitepro.cl' }],
  creator: 'MediSuite Pro',
  publisher: 'MediSuite Pro',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL('https://medisuitepro.cl'),
  alternates: { canonical: '/', languages: { 'es-CL': '/' } },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://medisuitepro.cl',
    title: 'MediSuite Pro - Sistema de Gestión Médica Premium',
    description:
      'Transforma tu centro médico con tecnología de vanguardia. IA, telemedicina y analítica avanzada. Líder en Chile con +25,000 profesionales.',
    siteName: 'MediSuite Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MediSuite Pro - Gestión Médica Inteligente',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediSuite Pro - Sistema de Gestión Médica Premium',
    description:
      'Transforma tu centro médico con tecnología de vanguardia.',
    images: ['/twitter-image.jpg'],
    creator: '@medisuitepro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'tu-codigo-de-verificacion-google',
    yandex: 'tu-codigo-yandex',
  },
  category: 'healthcare',
}

// ===============================
// 🔹 VIEWPORT
// ===============================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

// ===============================
// 🔹 JSON-LD (Schema SEO)
// ===============================
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: 'MediSuite Pro',
  description: 'Sistema de gestión médica premium para centros de salud',
  url: 'https://medisuitepro.cl',
  logo: 'https://medisuitepro.cl/logo.png',
  image: 'https://medisuitepro.cl/og-image.jpg',
  telephone: '+56-2-2845-7890',
  email: 'contacto@medisuitepro.cl',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+56-2-2845-7890',
    contactType: 'customer service',
    areaServed: 'CL',
    availableLanguage: ['es'],
    contactOption: 'TollFree',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
  },
  sameAs: [
    'https://www.facebook.com/medisuitepro',
    'https://www.twitter.com/medisuitepro',
    'https://www.linkedin.com/company/medisuitepro',
    'https://www.instagram.com/medisuitepro',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Apoquindo 4800',
    addressLocality: 'Las Condes',
    addressRegion: 'Santiago',
    postalCode: '7550000',
    addressCountry: 'CL',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '2400',
    bestRating: '5',
    worstRating: '1',
  },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'CLP',
    lowPrice: '69990',
    highPrice: '499990',
  },
}

// ===============================
// 🔹 LAYOUT ROOT
// ===============================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es-CL"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>

      <body
        className={`min-h-screen bg-white text-gray-900 antialiased ${inter.className}`}
      >
        {/* Accesibilidad: saltar al contenido */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>

        {/* 👇 Solo muestra Header/Footer en "/" */}
        <MarketingChrome onlyOn={['/']}>{children}</MarketingChrome>

        {/* Portales para modales o tooltips */}
        <div id="portal-root" />
        <div id="modal-root" />
      </body>
    </html>
  )
}
