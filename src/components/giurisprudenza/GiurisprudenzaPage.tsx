import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen, Brain, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const mockSentenze = [
  { id: '1', organo: 'Cassazione SS.UU.', numero: 'n. 4521/2025', data: '2025-03-10', massima: 'In tema di responsabilità medica, l\'onere della prova del nesso causale grava sul paziente che agisce per il risarcimento del danno.', materia: 'Civile', rilevanza: 95 },
  { id: '2', organo: 'Cassazione Sez. III', numero: 'n. 3892/2025', data: '2025-03-05', massima: 'Il danno da perdita di chance è risarcibile quando la probabilità perduta superi il 50% secondo un giudizio prognostico basato su dati scientifici.', materia: 'Civile', rilevanza: 88 },
  { id: '3', organo: 'Corte Costituzionale', numero: 'sent. n. 32/2025', data: '2025-03-01', massima: 'È illegittimo l\'art. 131-bis c.p. nella parte in cui non consente l\'applicazione della causa di non punibilità per particolare tenuità del fatto ai reati con pena massima superiore a cinque anni.', materia: 'Penale', rilevanza: 92 },
  { id: '4', organo: 'Cassazione Sez. Lav.', numero: 'n. 2156/2025', data: '2025-02-20', massima: 'Il licenziamento per giustificato motivo oggettivo è illegittimo qualora il datore di lavoro non dimostri l\'impossibilità di repêchage del lavoratore.', materia: 'Lavoro', rilevanza: 85 },
  { id: '5', organo: 'Consiglio di Stato', numero: 'n. 1823/2025', data: '2025-02-15', massima: 'L\'accesso civico generalizzato non può essere limitato per generiche esigenze di riservatezza dell\'amministrazione, dovendo il diniego essere adeguatamente motivato.', materia: 'Amministrativo', rilevanza: 78 },
]

export function GiurisprudenzaPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Giurisprudenza</h1>
          <p className="text-sm text-text-secondary mt-1">Banca dati giurisprudenziale con ricerca semantica AI</p>
        </div>
        <Button variant="gold" icon={<Brain size={16} />}>Ricerca Semantica AI</Button>
      </motion.div>

      <Card padding="md">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input placeholder="Cerca sentenze per massima, principio di diritto, norma..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />
          </div>
          <Button variant="secondary" icon={<Filter size={16} />}>Filtri</Button>
        </div>
      </Card>

      <div className="space-y-4">
        {mockSentenze.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="gold" size="sm">{s.organo}</Badge>
                  <Badge variant="default" size="sm">{s.materia}</Badge>
                  <span className="text-xs font-mono text-gold-400">{s.numero}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{new Date(s.data).toLocaleDateString('it-IT')}</span>
                  <Badge variant={s.rilevanza >= 90 ? 'green' : s.rilevanza >= 80 ? 'blue' : 'muted'} size="sm">{s.rilevanza}% rilevanza</Badge>
                </div>
              </div>
              <p className="text-sm text-text-primary leading-relaxed italic font-display">&laquo;{s.massima}&raquo;</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
