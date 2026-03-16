import { motion } from 'framer-motion'
import { GraduationCap, Play, Award, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { KPI } from '@/components/ui/KPI'

const mockCorsi = [
  { id: '1', titolo: 'Riforma Cartabia: impatto sulla pratica forense', materia: 'Processuale Civile', docente: 'Prof. Avv. Bianchi', crediti: 4, durata: '3h', tipo: 'on_demand', progresso: 65 },
  { id: '2', titolo: 'AI Act e implicazioni per gli studi legali', materia: 'Diritto Digitale', docente: 'Avv. Rossi', crediti: 2, durata: '1.5h', tipo: 'webinar', progresso: 0, data: '2025-03-25' },
  { id: '3', titolo: 'GDPR: gestione data breach e notifiche', materia: 'Privacy', docente: 'Dott. Verdi', crediti: 3, durata: '2h', tipo: 'on_demand', progresso: 100 },
  { id: '4', titolo: 'DM 55/2014 aggiornato: parametri forensi', materia: 'Deontologia', docente: 'Avv. Neri', crediti: 2, durata: '1h', tipo: 'on_demand', progresso: 30 },
]

export function AcademyPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-section-title text-text-primary">Academy</h1>
        <p className="text-sm text-text-secondary mt-1">Formazione continua e crediti formativi</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Crediti Ottenuti" value="9" icon={<Award size={18} />} variant="gold" />
        <KPI label="Crediti Obiettivo" value="15" icon={<GraduationCap size={18} />} />
        <KPI label="Corsi Completati" value="1" />
        <KPI label="Ore Formazione" value="6.5h" icon={<Clock size={18} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCorsi.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="gold" size="sm">{c.materia}</Badge>
                <div className="flex items-center gap-2">
                  <Badge variant={c.tipo === 'webinar' ? 'blue' : 'default'} size="sm">{c.tipo === 'webinar' ? 'Webinar Live' : 'On Demand'}</Badge>
                  <Badge variant="green" size="sm">{c.crediti} CFP</Badge>
                </div>
              </div>
              <h3 className="text-sm font-medium text-text-primary mb-1">{c.titolo}</h3>
              <p className="text-xs text-text-muted mb-3">{c.docente} — {c.durata}</p>
              {c.progresso > 0 && c.progresso < 100 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
                    <span>Progresso</span><span>{c.progresso}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-gold-400 rounded-full transition-all" style={{ width: `${c.progresso}%` }} />
                  </div>
                </div>
              )}
              {c.progresso === 100 ? (
                <Badge variant="green" size="sm" dot>Completato</Badge>
              ) : c.data ? (
                <Button variant="secondary" size="sm" icon={<Play size={12} />}>
                  {new Date(c.data).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Button>
              ) : (
                <Button variant="secondary" size="sm" icon={<Play size={12} />}>
                  {c.progresso > 0 ? 'Continua' : 'Inizia'}
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
