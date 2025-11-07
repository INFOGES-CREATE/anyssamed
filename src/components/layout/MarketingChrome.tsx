'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

type Props = {
  children: React.ReactNode
  /** Rutas donde SÍ se debe mostrar el Header/Footer (por defecto solo "/") */
  onlyOn?: string[]
}

export default function MarketingChrome({ children, onlyOn = ['/'] }: Props) {
  const pathname = usePathname()

  // Si usas basePath o i18n con prefijos, puedes ajustar aquí
  const showMarketingChrome = onlyOn.includes(pathname)

  return (
    <div className="flex min-h-screen flex-col">
      {showMarketingChrome && <Header />}

      {/* Contenido principal */}
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {children}
      </main>

      {showMarketingChrome && <Footer />}
    </div>
  )
}
