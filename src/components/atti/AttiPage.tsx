import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Plus, Search, Brain } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

const statoColors: Record<string, 'muted' | 'orange' | 'green' | 'blue' | 'gold' | 'purple'> = {
  bozza: 'muted', in_revisione: 'orange', approvato: 'green', firmato: 'blue', depositato: 'gold', notificato: 'purple', archiviato: 'muted',
}

const mockAtti = [
  { id: '1', titolo: 'Atto di citazione — Rossi c/ ASL Roma 1', tipo: 'atto_citazione', fascicolo: '2025/0042-CIV', stato: 'depositato', data: '2025-01-20', ai_generated: false },
  { id: '2', titolo: 'Comparsa di risposta — Verdi S.r.l.', tipo: 'comparsa_risposta', fascicolo: '2025/0038-CIV', stato: 'in_revisione', data: '2025-03-10', ai_generated: true },
  { id: '3', titolo: 'Memoria ex art. 183 VI co. n.1', tipo: 'memoria_183', fascicolo: '2025/0042-CIV', stato: 'bozza', data: '2025-03-14', ai_generated: true },
  { id: '4', titolo: 'Ricorso CTP — Accertamento IRPEF 2022', tipo: 'ricorso', fascicolo: '2025/0029-TRIB', stato: 'approvato', data: '2025-03-08', ai_generated: false },
  { id: '5', titolo: 'Querela — Truffa aggravata', tipo: 'querela', fascicolo: '2025/0015-PEN', stato: 'firmato', data: '2025-01-10', ai_generated: false },
]

export function AttiPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = mockAtti.filter((a) => !search || a.titolo.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Atti & Contratti</h1>
          <p className="text-sm text-text-secondary mt-1">{mockAtti.length} atti totali</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Brain size={16} />}>Redigi con AI</Button>
          <Button variant="gold" icon={<Plus size={16} />} onClick={() => navigate('/atti/nuovo')}>Nuovo Atto</Button>
        </div>
      </motion.div>

      <Card padding="md">
        <Input placeholder="Cerca atti per titolo, tipo, fascicolo..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText size={48} />} title="Nessun atto trovato" action={{ label: 'Nuovo Atto', onClick: () => navigate('/atti/nuovo') }} />
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card hover padding="none" className="cursor-pointer">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center">
                      <FileText size={18} className="text-gold-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-text-primary">{a.titolo}</h3>
                        {a.ai_generated && <Badge variant="gold" size="sm">AI</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="font-mono">{a.fascicolo}</span>
                        <span>{new Date(a.data).toLocaleDateString('it-IT')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={statoColors[a.stato] || 'default'} size="sm" dot>{a.stato.replace('_', ' ')}</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
