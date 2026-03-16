import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPIProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: { value: number; label?: string }
  variant?: 'default' | 'gold'
  className?: string
}

export function KPI({ label, value, icon, trend, variant = 'default', className = '' }: KPIProps) {
  const trendColor = trend
    ? trend.value > 0 ? 'text-accent-green' : trend.value < 0 ? 'text-accent-red' : 'text-text-muted'
    : ''

  const TrendIcon = trend
    ? trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`
        rounded-xl p-6 transition-all duration-300
        ${variant === 'gold'
          ? 'bg-bg-secondary border border-border-gold shadow-gold-sm hover:shadow-gold-md'
          : 'bg-bg-secondary border border-border-subtle hover:border-border-medium'
        }
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-label uppercase text-text-muted tracking-widest">{label}</span>
        {icon && <div className="text-gold-400">{icon}</div>}
      </div>
      <div className={`text-kpi font-sans ${variant === 'gold' ? 'gold-text' : 'text-text-primary'}`}>
        {value}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trendColor}`}>
          {TrendIcon && <TrendIcon size={14} />}
          <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          {trend.label && <span className="text-text-muted ml-1">{trend.label}</span>}
        </div>
      )}
    </motion.div>
  )
}
