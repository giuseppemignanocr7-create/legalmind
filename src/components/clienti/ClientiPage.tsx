import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

const mockClienti = [
  { id: '1', display_name: 'Rossi Mario', tipo: 'persona_fisica', codice_fiscale: 'RSSMRA80A01H501Z', stato: 'attivo', telefono: '+39 06 1234567', email: 'mario.rossi@email.it', fascicoli_count: 3, rating: 5 },
  { id: '2', display_name: 'Verdi S.r.l.', tipo: 'persona_giuridica', partita_iva: '12345678901', stato: 'attivo', telefono: '+39 02 9876543', email: 'info@verdi.it', fascicoli_count: 2, rating: 4 },
  { id: '3', display_name: 'Bianchi Laura', tipo: 'persona_fisica', codice_fiscale: 'BNCLRA75B41F205A', stato: 'attivo', telefono: '+39 333 4567890', email: 'l.bianchi@email.it', fascicoli_count: 1, rating: 4 },
  { id: '4', display_name: 'Alfa S.p.A.', tipo: 'persona_giuridica', partita_iva: '98765432109', stato: 'attivo', telefono: '+39 06 5551234', email: 'legal@alfa.it', fascicoli_count: 4, rating: 3 },
  { id: '5', display_name: 'Neri Francesco', tipo: 'persona_fisica', codice_fiscale: 'NREFNC90C15L219P', stato: 'potenziale', telefono: '+39 347 8901234', email: 'f.neri@email.it', fascicoli_count: 0, rating: 0 },
]

const statoColors: Record<string, 'green' | 'blue' | 'muted' | 'orange'> = {
  attivo: 'green', potenziale: 'blue', inattivo: 'muted', ex_cliente: 'orange',
}

export function ClientiPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = mockClienti.filter((c) =>
    !search || c.display_name.toLowerCase().includes(search.toLowerCase()) || c.codice_fiscale?.includes(search) || c.partita_iva?.includes(search)
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Clienti & CRM</h1>
          <p className="text-sm text-text-secondary mt-1">{mockClienti.length} soggetti in anagrafica</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Shield size={16} />}>Conflict Check</Button>
          <Button variant="gold" icon={<Plus size={16} />} onClick={() => navigate('/clienti/nuovo')}>Nuovo Cliente</Button>
        </div>
      </motion.div>

      <Card padding="md">
        <Input placeholder="Cerca per nome, codice fiscale, P.IVA..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users size={48} />} title="Nessun cliente trovato" description="Modifica la ricerca o aggiungi un nuovo cliente" action={{ label: 'Nuovo Cliente', onClick: () => navigate('/clienti/nuovo') }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card hover className="cursor-pointer" onClick={() => navigate(`/clienti/${c.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-bold text-gold-400">
                      {c.display_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">{c.display_name}</h3>
                      <p className="text-xs text-text-muted">{c.tipo === 'persona_fisica' ? 'Persona Fisica' : 'Persona Giuridica'}</p>
                    </div>
                  </div>
                  <Badge variant={statoColors[c.stato] || 'default'} size="sm">{c.stato}</Badge>
                </div>
                <div className="space-y-1 text-xs text-text-secondary">
                  {c.codice_fiscale && <div>CF: <span className="font-mono">{c.codice_fiscale}</span></div>}
                  {c.partita_iva && <div>P.IVA: <span className="font-mono">{c.partita_iva}</span></div>}
                  <div>{c.email}</div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle text-xs text-text-muted">
                  <span>{c.fascicoli_count} fascicol{c.fascicoli_count === 1 ? 'o' : 'i'}</span>
                  {c.rating > 0 && <span>{'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}</span>}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
