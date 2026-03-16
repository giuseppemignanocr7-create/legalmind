import type { ReactNode, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'gold' | 'glass'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantClasses = {
  default: 'bg-bg-secondary border border-border-subtle',
  gold: 'bg-bg-secondary border border-border-gold shadow-gold-sm',
  glass: 'glass-card',
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, variant = 'default', hover = false, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, borderColor: 'rgba(212,175,55,0.25)' } : undefined}
      className={`
        rounded-xl shadow-card transition-all duration-300
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}
