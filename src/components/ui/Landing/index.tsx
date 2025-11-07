'use client'

import { Loader2, Stethoscope } from 'lucide-react'

interface LoadingProps {
  fullScreen?: boolean
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Loading({ 
  fullScreen = false, 
  message = 'Cargando...', 
  size = 'md' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated Logo */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
        <div className={`relative ${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce`}>
          <Stethoscope className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
        </div>
      </div>

      {/* Spinner */}
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      </div>

      {/* Message */}
      {message && (
        <div className="text-center">
          <p className={`${textSizeClasses[size]} font-semibold text-gray-900 mb-1`}>
            {message}
          </p>
          <p className="text-sm text-gray-500">
            Por favor espere un momento
          </p>
        </div>
      )}

      {/* Progress Dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-12">
      {content}
    </div>
  )
}
