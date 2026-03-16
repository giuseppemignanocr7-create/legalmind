import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Plus, Search, FileSpreadsheet, Timer, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KPI } from '@/components/ui/KPI'

const statoColors: Record<string, 'muted' | 'blue' | 'green' | 'orange' | 'red' | 'gold'> = {
  bozza: 'muted', emessa: 'blue', pagata: 'green', parzialmente_pagata: 'orange', scaduta: 'red', inviata_sdi: 'gold',
}

const mockFatture = [
  { id: '1', numero: '2025/0012', cliente: 'Rossi Mario', fascicolo: '2025/0042-CIV', totale: 8500, stato: 'pagata', data: '2025-03-01' },
  { id: '2', numero: '2025/0011', cliente: 'Verdi S.r.l.', fascicolo: '2025/0038-CIV', totale: 4200, stato: 'emessa', data: '2025-02-28' },
  { id: '3', numero: '2025/0010', cliente: 'Alfa S.p.A.', fascicolo: '2025/0011-LAV', totale: 6800, stato: 'inviata_sdi', data: '2025-02-20' },
  { id: '4', numero: '2025/0009', cliente: 'Bianchi Laura', fascicolo: '2025/0033-CIV', totale: 2400, stato: 'scaduta', data: '2025-01-15' },
  { id: '5', numero: '2025/0008', cliente: 'Neri Francesco', fascicolo: '2025/0029-TRIB', totale: 5500, stato: 'parzialmente_pagata', data: '2025-01-10' },
]

export function ContabilitaPage() {
  const [search, setSearch] = useState('')

  const filtered = mockFatture.filter((f) => !search || f.cliente.toLowerCase().includes(search.toLowerCase()) || f.numero.includes(search))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Contabilità</h1>
          <p className="text-sm text-text-secondary mt-1">Fatturazione, parcelle e gestione finanziaria</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Timer size={16} />}>Time Tracking</Button>
          <Button variant="secondary" icon={<FileSpreadsheet size={16} />}>Parcella DM 55</Button>
          <Button variant="gold" icon={<Plus size={16} />}>Nuova Fattura</Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Fatturato YTD" value="€98.4k" icon={<Wallet size={18} />} trend={{ value: 15, label: 'vs anno prec.' }} variant="gold" />
        <KPI label="Incassato" value="€72.1k" icon={<TrendingUp size={18} />} trend={{ value: 8 }} />
        <KPI label="Crediti Aperti" value="€26.3k" trend={{ value: -5 }} />
        <KPI label="Fatture Scadute" value="3" trend={{ value: 20, label: 'attenzione' }} />
      </div>

      {/* Search */}
      <Card padding="md">
        <Input placeholder="Cerca fattura per numero, cliente..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />
      </Card>

      {/* Fatture list */}
      <Card padding="none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Numero</th>
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Cliente</th>
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Fascicolo</th>
              <th className="text-right text-label text-text-muted tracking-widest py-3 px-5">Totale</th>
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Stato</th>
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b border-border-subtle hover:bg-bg-tertiary transition-colors cursor-pointer">
                <td className="py-3 px-5 text-sm font-mono text-gold-400">{f.numero}</td>
                <td className="py-3 px-5 text-sm text-text-primary">{f.cliente}</td>
                <td className="py-3 px-5 text-xs font-mono text-text-muted">{f.fascicolo}</td>
                <td className="py-3 px-5 text-sm text-text-primary text-right font-medium">€{f.totale.toLocaleString('it-IT')}</td>
                <td className="py-3 px-5"><Badge variant={statoColors[f.stato] || 'default'} size="sm" dot>{f.stato.replace('_', ' ')}</Badge></td>
                <td className="py-3 px-5 text-xs text-text-muted">{new Date(f.data).toLocaleDateString('it-IT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
