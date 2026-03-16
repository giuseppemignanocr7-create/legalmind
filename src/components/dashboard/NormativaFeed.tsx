import { motion } from 'framer-motion'
import { Scale, ChevronRight, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useNavigate } from 'react-router-dom'

const severitaVariant: Record<string, 'muted' | 'blue' | 'orange' | 'red'> = {
  informativa: 'muted',
  media: 'blue',
  alta: 'orange',
  critica: 'red',
}

const mockNormativa = [
  { id: '1', titolo: 'D.L. 34/2025 — Riforma processo civile telematico', area: 'Processuale Civile', severita: 'critica', data: '2025-03-16', fonte: 'Gazzetta Ufficiale' },
  { id: '2', titolo: 'Cassazione SS.UU. n. 4521/2025 — Responsabilità medica', area: 'Civile', severita: 'alta', data: '2025-03-15', fonte: 'Cassazione' },
  { id: '3', titolo: 'Provvedimento Garante Privacy — Nuove linee guida cookie', area: 'Privacy', severita: 'media', data: '2025-03-14', fonte: 'Garante Privacy' },
  { id: '4', titolo: 'Circolare Agenzia Entrate n. 12/E — Superbonus residuo', area: 'Tributario', severita: 'alta', data: '2025-03-14', fonte: 'Agenzia Entrate' },
  { id: '5', titolo: 'Regolamento UE 2025/456 — AI Act applicazione', area: 'Diritto Digitale', severita: 'media', data: '2025-03-13', fonte: 'GU UE' },
]

export function NormativaFeed() {
  const navigate = useNavigate()

  return (
    <Card variant="default" padding="none">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-gold-400" />
          <h3 className="font-display text-lg font-semibold text-text-primary">Feed Normativo</h3>
        </div>
        <button
          onClick={() => navigate('/normativa')}
          className="text-xs text-text-muted hover:text-gold-400 transition-colors flex items-center gap-1"
        >
          Osservatorio <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-border-subtle">
        {mockNormativa.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="px-5 py-3 hover:bg-bg-tertiary transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <Badge variant={severitaVariant[n.severita] || 'muted'} size="sm" dot>
                {n.area}
              </Badge>
              <span className="text-[10px] text-text-muted">
                {new Date(n.data).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
            <div className="text-sm text-text-primary">{n.titolo}</div>
            <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
              {n.fonte} <ExternalLink size={8} />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
