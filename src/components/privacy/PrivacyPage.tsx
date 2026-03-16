import { motion } from 'framer-motion'
import { Lock, Plus, AlertTriangle, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KPI } from '@/components/ui/KPI'

const mockTrattamenti = [
  { id: '1', nome: 'Gestione fascicoli clienti', finalita: 'Esecuzione contratto professionale', base: 'Art. 6(1)(b) GDPR', categorie_dati: ['Dati identificativi', 'Dati giudiziari'], rischio: 'medio' },
  { id: '2', nome: 'Fatturazione elettronica', finalita: 'Obbligo legale', base: 'Art. 6(1)(c) GDPR', categorie_dati: ['Dati identificativi', 'Dati fiscali'], rischio: 'basso' },
  { id: '3', nome: 'Marketing studio legale', finalita: 'Consenso', base: 'Art. 6(1)(a) GDPR', categorie_dati: ['Email', 'Nome'], rischio: 'basso' },
  { id: '4', nome: 'Videosorveglianza sede', finalita: 'Legittimo interesse', base: 'Art. 6(1)(f) GDPR', categorie_dati: ['Immagini'], rischio: 'alto' },
]

const rischioColors: Record<string, 'green' | 'orange' | 'red'> = {
  basso: 'green', medio: 'orange', alto: 'red',
}

export function PrivacyPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Privacy & GDPR</h1>
          <p className="text-sm text-text-secondary mt-1">Registro trattamenti, DPIA, data breach, gestione consensi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<AlertTriangle size={16} />}>Data Breach</Button>
          <Button variant="secondary" icon={<Shield size={16} />}>DPIA Wizard</Button>
          <Button variant="gold" icon={<Plus size={16} />}>Nuovo Trattamento</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Trattamenti" value="4" icon={<FileText size={18} />} />
        <KPI label="DPIA Richieste" value="1" icon={<Shield size={18} />} />
        <KPI label="Data Breach" value="0" variant="gold" />
        <KPI label="Conformità" value="92%" />
      </div>

      <div>
        <h2 className="text-label text-text-muted mb-3">REGISTRO DEI TRATTAMENTI</h2>
        <div className="space-y-3">
          {mockTrattamenti.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover className="cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-text-primary">{t.nome}</h3>
                  <Badge variant={rischioColors[t.rischio]} size="sm" dot>Rischio {t.rischio}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-text-secondary">
                  <div><span className="text-text-muted">Finalità:</span> {t.finalita}</div>
                  <div><span className="text-text-muted">Base giuridica:</span> {t.base}</div>
                  <div><span className="text-text-muted">Dati:</span> {t.categorie_dati.join(', ')}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
