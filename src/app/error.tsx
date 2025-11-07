'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('⚠️ Error detectado:', error)
  }, [error])

  return (
    <html lang="es">
      <body className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-rose-100 to-pink-200 text-slate-900 dark:from-slate-900 dark:to-slate-800">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-10 rounded-3xl shadow-glow text-center max-w-lg animate-fade-in">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce-slow" />
          <h1 className="text-3xl font-bold mb-2">Ocurrió un error inesperado</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{error.message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => reset()}
              className="btn-primary"
            >
              Reintentar
            </button>
            <Link href="/" className="btn-secondary">
              Ir al inicio
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
