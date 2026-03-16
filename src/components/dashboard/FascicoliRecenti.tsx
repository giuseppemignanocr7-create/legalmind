import { motion } from 'framer-motion'
import { FolderOpen, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useNavigate } from 'react-router-dom'

const statoVariant: Record<string, 'green' | 'blue' | 'orange' | 'gold' | 'red' | 'muted'> = {
  aperto: 'green',
  in_corso: 'blue',
  sospeso: 'orange',
  in_attesa: 'gold',
  chiuso_favorevole: 'green',
  chiuso_sfavorevole: 'red',
  archiviato: 'muted',
}

const statoLabel: Record<string, string> = {
  aperto: 'Aperto',
  in_corso: 'In Corso',
  sospeso: 'Sospeso',
  in_attesa: 'In Attesa',
  chiuso_favorevole: 'Chiuso Fav.',
  chiuso_sfavorevole: 'Chiuso Sfav.',
  archiviato: 'Archiviato',
}

const mockFascicoli = [
  { id: '1', numero: '2025/0042-CIV', oggetto: 'Risarcimento danni da responsabilità medica', materia: 'Civile', stato: 'in_corso', avvocato: 'Avv. Bianchi' },
  { id: '2', numero: '2025/0038-CIV', oggetto: 'Opposizione decreto ingiuntivo — Banca XYZ', materia: 'Civile', stato: 'aperto', avvocato: 'Avv. Rossi' },
  { id: '3', numero: '2025/0015-PEN', oggetto: 'Procedimento penale — art. 640 c.p.', materia: 'Penale', stato: 'in_corso', avvocato: 'Avv. Verdi' },
  { id: '4', numero: '2025/0029-TRIB', oggetto: 'Ricorso avverso avviso di accertamento IRPEF 2022', materia: 'Tributario', stato: 'aperto', avvocato: 'Avv. Bianchi' },
  { id: '5', numero: '2025/0033-CIV', oggetto: 'Mediazione — Condominio Via Roma 15', materia: 'Civile', stato: 'in_attesa', avvocato: 'Avv. Neri' },
]

export function FascicoliRecenti() {
  const navigate = useNavigate()

  return (
    <Card variant="default" padding="none">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-gold-400" />
          <h3 className="font-display text-lg font-semibold text-text-primary">Fascicoli Recenti</h3>
        </div>
        <button
          onClick={() => navigate('/fascicoli')}
          className="text-xs text-text-muted hover:text-gold-400 transition-colors flex items-center gap-1"
        >
          Vedi tutti <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-border-subtle">
        {mockFascicoli.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/fascicoli/${f.id}`)}
            className="px-5 py-3 hover:bg-bg-tertiary transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gold-400">{f.numero}</span>
                <Badge variant={statoVariant[f.stato] || 'default'} size="sm">
                  {statoLabel[f.stato] || f.stato}
                </Badge>
              </div>
              <span className="text-[10px] text-text-muted">{f.avvocato}</span>
            </div>
            <div className="text-sm text-text-primary truncate">{f.oggetto}</div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
