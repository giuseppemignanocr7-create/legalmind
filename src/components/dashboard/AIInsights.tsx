import { motion } from 'framer-motion'
import { Brain, Sparkles, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/stores/uiStore'

const insights = [
  {
    icon: <AlertTriangle size={16} className="text-accent-red" />,
    titolo: '3 scadenze perentorie nei prossimi 5 giorni',
    descrizione: 'Fascicoli 2025/0042, 2025/0038, 2025/0015 richiedono attenzione immediata.',
    urgenza: 'critica' as const,
  },
  {
    icon: <TrendingUp size={16} className="text-accent-green" />,
    titolo: 'Tasso di successo in aumento',
    descrizione: 'Il tasso di successo delle cause civili è salito al 78% nel Q1 2025, +5% rispetto al Q4 2024.',
    urgenza: 'info' as const,
  },
  {
    icon: <Clock size={16} className="text-accent-orange" />,
    titolo: 'Ore fatturabili sotto obiettivo',
    descrizione: 'Avv. Rossi ha registrato solo 85 ore fatturabili su 160 obiettivo questo mese.',
    urgenza: 'warning' as const,
  },
  {
    icon: <Sparkles size={16} className="text-gold-400" />,
    titolo: 'Nuova giurisprudenza rilevante',
    descrizione: 'Cass. SS.UU. n. 4521/2025 potrebbe impattare 3 fascicoli attivi in materia di responsabilità medica.',
    urgenza: 'info' as const,
  },
]

const urgenzaVariant: Record<string, 'red' | 'green' | 'orange' | 'gold'> = {
  critica: 'red',
  info: 'gold',
  warning: 'orange',
}

export function AIInsights() {
  const { toggleCoreMindPanel } = useUIStore()

  return (
    <Card variant="gold" padding="none">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Brain size={16} className="text-bg-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">CoreMind AI Insights</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">Analisi automatica del tuo studio</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={toggleCoreMindPanel}>
          <Brain size={14} /> Apri CoreMind
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 pt-2">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-tertiary rounded-lg p-4 border border-border-subtle hover:border-border-gold transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              {insight.icon}
              <Badge variant={urgenzaVariant[insight.urgenza] || 'gold'} size="sm">
                {insight.urgenza === 'critica' ? 'Urgente' : insight.urgenza === 'warning' ? 'Attenzione' : 'Insight'}
              </Badge>
            </div>
            <h4 className="text-sm font-medium text-text-primary mb-1">{insight.titolo}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{insight.descrizione}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
