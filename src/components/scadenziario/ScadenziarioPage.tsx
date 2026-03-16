import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, List, Calculator, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const urgenzaVariant: Record<string, 'green' | 'blue' | 'orange' | 'red'> = {
  bassa: 'green', media: 'blue', alta: 'orange', critica: 'red',
}

const mockScadenze = [
  { id: '1', titolo: 'Deposito memoria ex art. 183 c.p.c.', fascicolo: '2025/0042-CIV', data: '2025-03-17', urgenza: 'critica', tipo: 'termine_perentorio', stato: 'attiva', riferimento: 'art. 183 c.p.c.' },
  { id: '2', titolo: 'Termine opposizione decreto ingiuntivo', fascicolo: '2025/0038-CIV', data: '2025-03-18', urgenza: 'critica', tipo: 'termine_perentorio', stato: 'attiva', riferimento: 'art. 641 c.p.c.' },
  { id: '3', titolo: 'Scadenza termini indagini preliminari', fascicolo: '2025/0015-PEN', data: '2025-03-19', urgenza: 'alta', tipo: 'termine_processuale', stato: 'attiva', riferimento: 'art. 407 c.p.p.' },
  { id: '4', titolo: 'Presentazione ricorso CTP', fascicolo: '2025/0029-TRIB', data: '2025-03-20', urgenza: 'alta', tipo: 'termine_perentorio', stato: 'attiva', riferimento: 'art. 21 D.Lgs. 546/92' },
  { id: '5', titolo: 'Rinnovo mandato professionale', fascicolo: '2025/0011-CIV', data: '2025-03-22', urgenza: 'media', tipo: 'adempimento', stato: 'attiva', riferimento: '' },
  { id: '6', titolo: 'Deposito documenti udienza', fascicolo: '2025/0042-CIV', data: '2025-03-25', urgenza: 'alta', tipo: 'termine_ordinatorio', stato: 'attiva', riferimento: 'art. 87 disp. att. c.p.c.' },
  { id: '7', titolo: 'Scadenza termini appello', fascicolo: '2024/0198-CIV', data: '2025-03-12', urgenza: 'critica', tipo: 'termine_perentorio', stato: 'completata', riferimento: 'art. 325 c.p.c.' },
]

export function ScadenziarioPage() {
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista')

  const attive = mockScadenze.filter((s) => s.stato === 'attiva')
  const completate = mockScadenze.filter((s) => s.stato === 'completata')

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Scadenziario Forense</h1>
          <p className="text-sm text-text-secondary mt-1">{attive.length} scadenze attive</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('lista')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'lista' ? 'bg-gold-400/10 text-gold-400' : 'text-text-muted hover:text-text-secondary'}`}>
              <List size={14} />
            </button>
            <button onClick={() => setViewMode('calendario')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'calendario' ? 'bg-gold-400/10 text-gold-400' : 'text-text-muted hover:text-text-secondary'}`}>
              <Calendar size={14} />
            </button>
          </div>
          <Button variant="secondary" icon={<Calculator size={16} />}>Calcola Termini</Button>
          <Button variant="gold" icon={<Plus size={16} />}>Nuova Scadenza</Button>
        </div>
      </motion.div>

      {/* Active deadlines */}
      <div>
        <h2 className="text-label text-text-muted mb-3 flex items-center gap-2"><AlertTriangle size={12} /> SCADENZE ATTIVE</h2>
        <div className="space-y-2">
          {attive.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card hover padding="none" className="cursor-pointer">
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-1 h-12 rounded-full ${s.urgenza === 'critica' ? 'bg-accent-red' : s.urgenza === 'alta' ? 'bg-accent-orange' : s.urgenza === 'media' ? 'bg-accent-blue' : 'bg-accent-green'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-text-primary">{s.titolo}</h3>
                      <Badge variant={urgenzaVariant[s.urgenza]} size="sm">{s.urgenza}</Badge>
                      {s.tipo === 'termine_perentorio' && <Badge variant="red" size="sm">Perentorio</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="font-mono">{s.fascicolo}</span>
                      {s.riferimento && <span>{s.riferimento}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-text-primary">{new Date(s.data).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</div>
                    <div className="text-[10px] text-text-muted">
                      {Math.ceil((new Date(s.data).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} giorni
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Completed */}
      {completate.length > 0 && (
        <div>
          <h2 className="text-label text-text-muted mb-3 flex items-center gap-2"><CheckCircle size={12} /> COMPLETATE</h2>
          <div className="space-y-2 opacity-60">
            {completate.map((s) => (
              <Card key={s.id} padding="none">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-1 h-12 rounded-full bg-accent-green" />
                  <div className="flex-1">
                    <h3 className="text-sm text-text-secondary line-through">{s.titolo}</h3>
                    <div className="text-xs text-text-muted font-mono">{s.fascicolo}</div>
                  </div>
                  <Badge variant="green" size="sm">Completata</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
