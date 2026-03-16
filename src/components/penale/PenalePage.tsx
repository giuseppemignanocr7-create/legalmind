import { motion } from 'framer-motion'
import { Shield, Plus, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KPI } from '@/components/ui/KPI'

const mockProcedimenti = [
  { id: '1', fascicolo: '2025/0015-PEN', notizia_reato: 'Truffa aggravata', articoli: ['art. 640 c.p.', 'art. 61 n.7 c.p.'], fase: 'Indagini preliminari', misura: 'Obbligo dimora', prescrizione: '2031-06-15' },
  { id: '2', fascicolo: '2025/0022-PEN', notizia_reato: 'Lesioni personali colpose', articoli: ['art. 590 c.p.'], fase: 'Dibattimento', misura: null, prescrizione: '2028-03-20' },
  { id: '3', fascicolo: '2024/0156-PEN', notizia_reato: 'Bancarotta fraudolenta', articoli: ['art. 216 L.F.'], fase: 'GUP', misura: 'Divieto espatrio', prescrizione: '2032-11-01' },
]

export function PenalePage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Diritto Penale</h1>
          <p className="text-sm text-text-secondary mt-1">Gestione procedimenti penali, misure cautelari, prescrizioni</p>
        </div>
        <Button variant="gold" icon={<Plus size={16} />}>Nuovo Procedimento</Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Procedimenti Attivi" value="3" icon={<Shield size={18} />} />
        <KPI label="Misure Cautelari" value="2" icon={<AlertTriangle size={18} />} />
        <KPI label="Udienze Mese" value="5" icon={<Clock size={18} />} />
        <KPI label="Prescrizioni < 1 Anno" value="0" variant="gold" />
      </div>

      <div className="space-y-3">
        {mockProcedimenti.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gold-400">{p.fascicolo}</span>
                  <Badge variant="red" size="sm">{p.fase}</Badge>
                  {p.misura && <Badge variant="orange" size="sm">{p.misura}</Badge>}
                </div>
              </div>
              <h3 className="text-sm font-medium text-text-primary mb-1">{p.notizia_reato}</h3>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>Articoli: {p.articoli.join(', ')}</span>
                <span>|</span>
                <span>Prescrizione: {new Date(p.prescrizione).toLocaleDateString('it-IT')}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
