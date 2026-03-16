import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 text-text-muted opacity-50">{icon}</div>
      )}
      <h3 className="text-lg font-display font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button variant="gold" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
