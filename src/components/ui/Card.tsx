// frontend/src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'premium'
  className?: string
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const variants = {
    default: 'bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6',
    glass: 'card-glass',
    premium: 'card-premium',
  }

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}
