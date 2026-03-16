import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, Filter, Bell, ExternalLink, Brain } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'

const severitaVariant: Record<string, 'muted' | 'blue' | 'orange' | 'red'> = {
  informativa: 'muted', media: 'blue', alta: 'orange', critica: 'red',
}

const mockFeed = [
  { id: '1', titolo: 'D.L. 34/2025 — Riforma processo civile telematico', area: 'Processuale Civile', severita: 'critica', data: '2025-03-16', fonte: 'Gazzetta Ufficiale', sintesi: 'Nuove disposizioni per il deposito telematico degli atti processuali. Obbligo di firma digitale CAdES per tutti gli atti dal 01/06/2025.' },
  { id: '2', titolo: 'Cassazione SS.UU. n. 4521/2025 — Responsabilità medica: onere della prova', area: 'Civile', severita: 'alta', data: '2025-03-15', fonte: 'Cassazione', sintesi: 'Le Sezioni Unite chiariscono la ripartizione dell\'onere probatorio nelle azioni di responsabilità medica. Il paziente deve provare il nesso causale.' },
  { id: '3', titolo: 'Provvedimento Garante Privacy — Linee guida cookie e tracciamento', area: 'Privacy', severita: 'media', data: '2025-03-14', fonte: 'Garante Privacy', sintesi: 'Aggiornamento delle linee guida sui cookie. Nuove modalità di acquisizione del consenso e gestione dei banner.' },
  { id: '4', titolo: 'Circolare Agenzia Entrate n. 12/E — Superbonus residuo e cessione crediti', area: 'Tributario', severita: 'alta', data: '2025-03-14', fonte: 'Agenzia Entrate', sintesi: 'Chiarimenti sulla gestione dei crediti da Superbonus residui e nuove modalità di compensazione.' },
  { id: '5', titolo: 'Regolamento UE 2025/456 — AI Act: prime norme di applicazione', area: 'Diritto Digitale', severita: 'media', data: '2025-03-13', fonte: 'GU UE', sintesi: 'Prime disposizioni attuative del Regolamento sull\'Intelligenza Artificiale. Classificazione dei sistemi ad alto rischio.' },
  { id: '6', titolo: 'Corte Costituzionale sent. n. 32/2025 — Legittimità art. 131-bis c.p.', area: 'Penale', severita: 'alta', data: '2025-03-12', fonte: 'Corte Costituzionale', sintesi: 'Dichiarata l\'illegittimità costituzionale parziale dell\'art. 131-bis c.p. nella parte in cui esclude i reati con pena superiore a 5 anni.' },
]

export function OsservatorioPage() {
  const [filterArea, setFilterArea] = useState('')
  const [filterSeverita, setFilterSeverita] = useState('')

  const filtered = mockFeed.filter((n) => {
    if (filterArea && n.area !== filterArea) return false
    if (filterSeverita && n.severita !== filterSeverita) return false
    return true
  })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Osservatorio Normativo</h1>
          <p className="text-sm text-text-secondary mt-1">Feed aggiornamenti normativi e giurisprudenziali</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Bell size={16} />}>Configura Alert</Button>
          <Button variant="secondary" icon={<Brain size={16} />}>Analisi AI Impatto</Button>
        </div>
      </motion.div>

      {/* Filters */}
      <Card padding="md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select label="Area" options={[{ value: '', label: 'Tutte' }, { value: 'Civile', label: 'Civile' }, { value: 'Penale', label: 'Penale' }, { value: 'Tributario', label: 'Tributario' }, { value: 'Privacy', label: 'Privacy' }]} value={filterArea} onChange={(e) => setFilterArea(e.target.value)} />
          <Select label="Severità" options={[{ value: '', label: 'Tutte' }, { value: 'critica', label: 'Critica' }, { value: 'alta', label: 'Alta' }, { value: 'media', label: 'Media' }, { value: 'informativa', label: 'Informativa' }]} value={filterSeverita} onChange={(e) => setFilterSeverita(e.target.value)} />
        </div>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {filtered.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={severitaVariant[n.severita]} size="md" dot>{n.severita}</Badge>
                  <Badge variant="default" size="sm">{n.area}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{n.fonte}</span>
                  <span>{new Date(n.data).toLocaleDateString('it-IT')}</span>
                  <ExternalLink size={12} />
                </div>
              </div>
              <h3 className="text-base font-display font-semibold text-text-primary mb-2">{n.titolo}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{n.sintesi}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
