import { motion } from 'framer-motion'
import { Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useNavigate } from 'react-router-dom'

const urgenzaVariant: Record<string, 'green' | 'blue' | 'orange' | 'red'> = {
  bassa: 'green',
  media: 'blue',
  alta: 'orange',
  critica: 'red',
}

const mockScadenze = [
  { id: '1', titolo: 'Deposito memoria ex art. 183 c.p.c.', fascicolo: '2025/0042-CIV', data: '2025-03-17', urgenza: 'critica' },
  { id: '2', titolo: 'Termine opposizione decreto ingiuntivo', fascicolo: '2025/0038-CIV', data: '2025-03-18', urgenza: 'alta' },
  { id: '3', titolo: 'Scadenza termini indagini preliminari', fascicolo: '2025/0015-PEN', data: '2025-03-19', urgenza: 'alta' },
  { id: '4', titolo: 'Presentazione ricorso CTP', fascicolo: '2025/0029-TRIB', data: '2025-03-20', urgenza: 'media' },
  { id: '5', titolo: 'Rinnovo mandato professionale', fascicolo: '2025/0011-CIV', data: '2025-03-22', urgenza: 'bassa' },
]

export function ScadenzeWidget() {
  const navigate = useNavigate()

  return (
    <Card variant="default" padding="none">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-gold-400" />
          <h3 className="font-display text-lg font-semibold text-text-primary">Scadenze Prossime</h3>
        </div>
        <button
          onClick={() => navigate('/scadenziario')}
          className="text-xs text-text-muted hover:text-gold-400 transition-colors flex items-center gap-1"
        >
          Vedi tutte <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-border-subtle">
        {mockScadenze.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-5 py-3 hover:bg-bg-tertiary transition-colors cursor-pointer"
          >
            {s.urgenza === 'critica' && (
              <AlertTriangle size={14} className="text-accent-red shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-text-primary truncate">{s.titolo}</div>
              <div className="text-xs text-text-muted mt-0.5">{s.fascicolo}</div>
            </div>
            <Badge variant={urgenzaVariant[s.urgenza]} size="sm" dot>
              {new Date(s.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
            </Badge>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
