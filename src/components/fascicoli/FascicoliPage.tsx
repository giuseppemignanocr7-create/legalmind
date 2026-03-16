import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderOpen, Plus, Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { MATERIE_LEGALI, STATI_FASCICOLO } from '@/config/constants'

const statoVariant: Record<string, 'green' | 'blue' | 'orange' | 'gold' | 'red' | 'muted' | 'purple'> = {
  aperto: 'green', in_corso: 'blue', sospeso: 'orange', in_attesa: 'gold',
  chiuso_favorevole: 'green', chiuso_sfavorevole: 'red', chiuso_transazione: 'purple', archiviato: 'muted', annullato: 'muted',
}

const mockFascicoli = [
  { id: '1', numero_interno: '2025/0042-CIV', oggetto: 'Risarcimento danni da responsabilità medica — Rossi c/ ASL Roma 1', materia: 'civile', stato: 'in_corso', valore_causa: 250000, avvocato: 'Avv. Bianchi M.', data_apertura: '2025-01-15', priorita: 5 },
  { id: '2', numero_interno: '2025/0038-CIV', oggetto: 'Opposizione decreto ingiuntivo — Banca XYZ c/ Verdi S.r.l.', materia: 'civile', stato: 'aperto', valore_causa: 85000, avvocato: 'Avv. Rossi G.', data_apertura: '2025-02-03', priorita: 4 },
  { id: '3', numero_interno: '2025/0015-PEN', oggetto: 'Proc. pen. n. 1234/2025 — Truffa aggravata art. 640 c.p.', materia: 'penale', stato: 'in_corso', valore_causa: null, avvocato: 'Avv. Verdi L.', data_apertura: '2025-01-08', priorita: 5 },
  { id: '4', numero_interno: '2025/0029-TRIB', oggetto: 'Ricorso CTP avverso avviso accertamento IRPEF 2022', materia: 'tributario', stato: 'aperto', valore_causa: 120000, avvocato: 'Avv. Bianchi M.', data_apertura: '2025-02-12', priorita: 3 },
  { id: '5', numero_interno: '2025/0033-CIV', oggetto: 'Mediazione obbligatoria — Condominio Via Roma 15', materia: 'civile', stato: 'in_attesa', valore_causa: 35000, avvocato: 'Avv. Neri A.', data_apertura: '2025-02-20', priorita: 2 },
  { id: '6', numero_interno: '2025/0011-LAV', oggetto: 'Vertenza lavoro — Licenziamento per g.m.o. — Bianchi c/ Alfa S.p.A.', materia: 'lavoro', stato: 'in_corso', valore_causa: 65000, avvocato: 'Avv. Rossi G.', data_apertura: '2025-01-05', priorita: 4 },
  { id: '7', numero_interno: '2024/0198-CIV', oggetto: 'Esecuzione forzata immobiliare — Proc. es. n. 456/2024', materia: 'esecuzioni', stato: 'chiuso_favorevole', valore_causa: 180000, avvocato: 'Avv. Bianchi M.', data_apertura: '2024-09-10', priorita: 1 },
]

export function FascicoliPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterMateria, setFilterMateria] = useState('')
  const [filterStato, setFilterStato] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = mockFascicoli.filter((f) => {
    if (search && !f.oggetto.toLowerCase().includes(search.toLowerCase()) && !f.numero_interno.toLowerCase().includes(search.toLowerCase())) return false
    if (filterMateria && f.materia !== filterMateria) return false
    if (filterStato && f.stato !== filterStato) return false
    return true
  })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Fascicoli</h1>
          <p className="text-sm text-text-secondary mt-1">{mockFascicoli.length} fascicoli totali</p>
        </div>
        <Button variant="gold" icon={<Plus size={16} />} onClick={() => navigate('/fascicoli/nuovo')}>
          Nuovo Fascicolo
        </Button>
      </motion.div>

      {/* Search & Filters */}
      <Card padding="md">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Cerca per numero, oggetto, cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <Button variant="secondary" icon={<SlidersHorizontal size={16} />} onClick={() => setShowFilters(!showFilters)}>
            Filtri
          </Button>
        </div>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border-subtle">
            <Select label="Materia" options={[{ value: '', label: 'Tutte' }, ...MATERIE_LEGALI.map((m) => ({ value: m.value, label: m.label }))]} value={filterMateria} onChange={(e) => setFilterMateria(e.target.value)} />
            <Select label="Stato" options={[{ value: '', label: 'Tutti' }, ...STATI_FASCICOLO.map((s) => ({ value: s.value, label: s.label }))]} value={filterStato} onChange={(e) => setFilterStato(e.target.value)} />
          </motion.div>
        )}
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={<FolderOpen size={48} />} title="Nessun fascicolo trovato" description="Modifica i filtri di ricerca o crea un nuovo fascicolo" action={{ label: 'Nuovo Fascicolo', onClick: () => navigate('/fascicoli/nuovo') }} />
      ) : (
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card hover padding="none" className="cursor-pointer" onClick={() => navigate(`/fascicoli/${f.id}`)}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gold-400 bg-gold-400/5 px-2 py-0.5 rounded">{f.numero_interno}</span>
                      <Badge variant={statoVariant[f.stato] || 'default'} size="sm" dot>{STATI_FASCICOLO.find((s) => s.value === f.stato)?.label || f.stato}</Badge>
                      <Badge variant="default" size="sm">{MATERIE_LEGALI.find((m) => m.value === f.materia)?.label || f.materia}</Badge>
                      {f.priorita >= 4 && <Badge variant="red" size="sm">P{f.priorita}</Badge>}
                    </div>
                    <span className="text-xs text-text-muted">{f.avvocato}</span>
                  </div>
                  <h3 className="text-sm font-medium text-text-primary">{f.oggetto}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                    <span>Aperto: {new Date(f.data_apertura).toLocaleDateString('it-IT')}</span>
                    {f.valore_causa && <span>Valore: €{f.valore_causa.toLocaleString('it-IT')}</span>}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
