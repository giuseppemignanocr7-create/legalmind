import { motion } from 'framer-motion'
import { Briefcase, Plus, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KPI } from '@/components/ui/KPI'

const mockVertenze = [
  { id: '1', fascicolo: '2025/0011-LAV', oggetto: 'Licenziamento per g.m.o. — Bianchi c/ Alfa S.p.A.', ccnl: 'Metalmeccanico', motivo: 'Giustificato motivo oggettivo', pretese: 65000, stato: 'Tentativo conciliazione' },
  { id: '2', fascicolo: '2025/0025-LAV', oggetto: 'Differenze retributive — Verdi c/ Beta S.r.l.', ccnl: 'Commercio', motivo: 'Inadempimento contrattuale', pretese: 28000, stato: 'Ricorso depositato' },
  { id: '3', fascicolo: '2024/0178-LAV', oggetto: 'Mobbing e demansionamento — Neri c/ Gamma S.p.A.', ccnl: 'Credito', motivo: 'Risarcimento danni', pretese: 95000, stato: 'Istruttoria in corso' },
]

export function LavoroPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Diritto del Lavoro</h1>
          <p className="text-sm text-text-secondary mt-1">Vertenze, CCNL, calcolo TFR, lettere disciplinari</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Calculator size={16} />}>Calcolo TFR</Button>
          <Button variant="gold" icon={<Plus size={16} />}>Nuova Vertenza</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Vertenze Attive" value="3" icon={<Briefcase size={18} />} />
        <KPI label="Valore Pretese" value="€188k" variant="gold" />
        <KPI label="Conciliazioni" value="1" />
        <KPI label="Tasso Successo" value="82%" />
      </div>

      <div className="space-y-3">
        {mockVertenze.map((v, i) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gold-400">{v.fascicolo}</span>
                  <Badge variant="blue" size="sm">{v.ccnl}</Badge>
                  <Badge variant="orange" size="sm">{v.motivo}</Badge>
                </div>
                <span className="text-xs text-text-muted">{v.stato}</span>
              </div>
              <h3 className="text-sm font-medium text-text-primary">{v.oggetto}</h3>
              <div className="text-xs text-text-muted mt-1">Pretese: €{v.pretese.toLocaleString('it-IT')}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
