// src/components/layout/MarketingChrome.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

type Props = {
  children: React.ReactNode
  /** Rutas donde SÍ se debe mostrar el Header/Footer (por defecto solo "/") */
  onlyOn?: string[]
}

/** Pixels de scroll antes de mostrar el Header global en la landing */
const SCROLL_THRESHOLD = 120

export default function MarketingChrome({ children, onlyOn = ['/'] }: Props) {
  const pathname = usePathname()

  const isLanding = pathname === '/'
  const showMarketingChrome = onlyOn.includes(pathname)

  // En páginas que no son la landing → header visible de una
  // En la landing → oculto al inicio, se muestra según scroll
  const [showHeader, setShowHeader] = useState(
    () => showMarketingChrome && !isLanding
  )

  useEffect(() => {
    // Si esta ruta NO está en `onlyOn`, no mostramos nada de chrome
    if (!showMarketingChrome) {
      setShowHeader(false)
      return
    }

    // Si NO es la landing → header siempre visible
    if (!isLanding) {
      setShowHeader(true)
      return
    }

    // 🔹 Landing ("/"): el header del layout solo aparece al hacer scroll
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset
      setShowHeader(y > SCROLL_THRESHOLD)
    }

    // Estado inicial
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLanding, showMarketingChrome])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header GLOBAL del layout
          - En "/" → solo cuando showHeader === true (después de scroll)
          - En otras rutas incluidas en onlyOn → siempre */}
      {showHeader && <Header />}

      {/* Contenido principal */}
      <main
        id="main-content"
        className="flex-1 focus:outline-none"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Footer solo en rutas incluidas en `onlyOn` */}
      {showMarketingChrome && <Footer />}
    </div>
  )
}
