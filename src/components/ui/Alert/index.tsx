'use client'

import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { useState } from 'react'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export default function Alert({
  type = 'info',
  title,
  message,
  dismissible = true,
  onDismiss,
  action
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
      buttonColor: 'text-green-600 hover:bg-green-100'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      buttonColor: 'text-red-600 hover:bg-red-100'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
      buttonColor: 'text-yellow-600 hover:bg-yellow-100'
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      buttonColor: 'text-blue-600 hover:bg-blue-100'
    }
  }

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor, messageColor, buttonColor } = config[type]

  return (
    <div className={`${bgColor} border ${borderColor} rounded-2xl p-5 shadow-lg animate-fade-in-up`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0 border ${borderColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${titleColor} mb-1`}>{title}</h4>
          {message && (
            <p className={`text-sm ${messageColor} leading-relaxed`}>{message}</p>
          )}

          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-semibold ${buttonColor} transition-colors`}
            >
              {action.label}
            </button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`p-1.5 rounded-lg ${buttonColor} transition-all flex-shrink-0`}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
