import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'gold' | 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'muted'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-bg-tertiary text-text-secondary border-border-medium',
  gold: 'bg-gold-400/10 text-gold-400 border-gold-400/20',
  green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  red: 'bg-accent-red/10 text-accent-red border-accent-red/20',
  blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
  purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  muted: 'bg-bg-elevated text-text-muted border-border-subtle',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-text-secondary',
  gold: 'bg-gold-400',
  green: 'bg-accent-green',
  red: 'bg-accent-red',
  blue: 'bg-accent-blue',
  orange: 'bg-accent-orange',
  purple: 'bg-accent-purple',
  muted: 'bg-text-muted',
}

export function Badge({ children, variant = 'default', size = 'sm', dot, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 border rounded-full font-medium
        ${variantClasses[variant]}
        ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}
