import { motion } from 'framer-motion'
import { Building2, Plus, Calculator, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KPI } from '@/components/ui/KPI'

const mockContenziosi = [
  { id: '1', fascicolo: '2025/0029-TRIB', tipo_atto: 'Avviso di accertamento', ente: 'Agenzia Entrate', tributo: 'IRPEF', anno_imposta: 2022, totale_pretesa: 120000, stato: 'Ricorso depositato', probabilita: 68 },
  { id: '2', fascicolo: '2025/0035-TRIB', tipo_atto: 'Cartella esattoriale', ente: 'Agenzia Riscossione', tributo: 'IVA', anno_imposta: 2021, totale_pretesa: 45000, stato: 'In attesa udienza', probabilita: 72 },
  { id: '3', fascicolo: '2024/0189-TRIB', tipo_atto: 'Avviso di accertamento', ente: 'Comune di Roma', tributo: 'IMU', anno_imposta: 2020, totale_pretesa: 18000, stato: 'Sentenza CTP favorevole', probabilita: 85 },
]

export function TributarioPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Diritto Tributario</h1>
          <p className="text-sm text-text-secondary mt-1">Contenzioso tributario, ricorsi, cartelle esattoriali</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Calculator size={16} />}>Calcolo Sanzioni</Button>
          <Button variant="gold" icon={<Plus size={16} />}>Nuovo Ricorso</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Contenziosi Attivi" value="3" icon={<Building2 size={18} />} />
        <KPI label="Valore Pretese" value="€183k" icon={<TrendingDown size={18} />} variant="gold" />
        <KPI label="Tasso Accoglimento" value="76%" />
        <KPI label="Risparmio Ottenuto" value="€95k" />
      </div>

      <div className="space-y-3">
        {mockContenziosi.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gold-400">{c.fascicolo}</span>
                  <Badge variant="blue" size="sm">{c.tipo_atto}</Badge>
                  <Badge variant="default" size="sm">{c.tributo} {c.anno_imposta}</Badge>
                </div>
                <Badge variant={c.probabilita >= 70 ? 'green' : 'orange'} size="sm">AI: {c.probabilita}%</Badge>
              </div>
              <h3 className="text-sm font-medium text-text-primary mb-1">{c.ente} — {c.tributo} anno {c.anno_imposta}</h3>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Pretesa: €{c.totale_pretesa.toLocaleString('it-IT')}</span>
                <span>{c.stato}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
