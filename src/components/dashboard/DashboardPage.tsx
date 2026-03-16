import { motion } from 'framer-motion'
import { StatsOverview } from './StatsOverview'
import { ScadenzeWidget } from './ScadenzeWidget'
import { UdienzeWidget } from './UdienzeWidget'
import { FascicoliRecenti } from './FascicoliRecenti'
import { NormativaFeed } from './NormativaFeed'
import { AIInsights } from './AIInsights'

export function DashboardPage() {
  return (
    <div className="space-y-6 animate-stagger">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-section-title text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Panoramica dello studio — {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* KPI Row */}
      <StatsOverview />

      {/* Row 2: Scadenze + Udienze */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScadenzeWidget />
        <UdienzeWidget />
      </div>

      {/* Row 3: Fascicoli recenti + Feed normativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FascicoliRecenti />
        <NormativaFeed />
      </div>

      {/* Row 4: AI Insights */}
      <AIInsights />
    </div>
  )
}
