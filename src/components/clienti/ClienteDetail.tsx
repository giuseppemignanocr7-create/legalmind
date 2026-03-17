import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, User, Building2, Phone, Mail, FileText, Scale,
  Star, Edit, Trash2, Plus, TrendingUp, AlertTriangle, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KPI } from '@/components/ui/KPI'

const mockClienti: Record<string, any> = {
  '1': {
    id: '1', display_name: 'Rossi Mario', tipo: 'persona_fisica',
    codice_fiscale: 'RSSMRA80A01H501Z', stato: 'attivo',
    telefono: '+39 06 1234567', email: 'mario.rossi@email.it',
    pec: 'mario.rossi@pec.it', indirizzo: 'Via Roma 42, 00186 Roma (RM)',
    data_nascita: '1980-01-01', luogo_nascita: 'Roma',
    note: 'Cliente storico, molto affidabile. Pagamenti sempre puntuali.',
    fascicoli_count: 3, rating: 5, created_at: '2023-06-15',
    fascicoli: [
      { id: 'f1', numero: '2024/0012-CIV', oggetto: 'Risarcimento danni da sinistro stradale', stato: 'in_corso', materia: 'civile' },
      { id: 'f2', numero: '2024/0034-LAV', oggetto: 'Impugnazione licenziamento', stato: 'aperto', materia: 'lavoro' },
      { id: 'f3', numero: '2023/0089-CIV', oggetto: 'Recupero credito professionale', stato: 'chiuso_vinto', materia: 'civile' },
    ],
    fatture: [
      { id: 'ft1', numero: '2024/0045', data: '2024-11-15', importo: 3500, stato: 'pagata' },
      { id: 'ft2', numero: '2024/0078', data: '2025-01-20', importo: 2800, stato: 'emessa' },
      { id: 'ft3', numero: '2025/0012', data: '2025-03-01', importo: 1500, stato: 'emessa' },
    ],
    attivita_recenti: [
      { data: '2025-03-14', descrizione: 'Redazione memoria ex art. 183 c.p.c.', ore: 3.5 },
      { data: '2025-03-10', descrizione: 'Udienza di trattazione - Trib. Roma', ore: 2.0 },
      { data: '2025-03-05', descrizione: 'Conferenza telefonica con cliente', ore: 0.5 },
    ],
  },
  '2': {
    id: '2', display_name: 'Verdi S.r.l.', tipo: 'persona_giuridica',
    partita_iva: '12345678901', codice_fiscale: '12345678901', stato: 'attivo',
    telefono: '+39 02 9876543', email: 'info@verdi.it',
    pec: 'verdi@pec.it', indirizzo: 'Via Montenapoleone 10, 20121 Milano (MI)',
    rappresentante_legale: 'Giuseppe Verdi', note: 'Azienda in forte crescita.',
    fascicoli_count: 2, rating: 4, created_at: '2024-01-10',
    fascicoli: [
      { id: 'f4', numero: '2024/0056-SOC', oggetto: 'Contenzioso societario - clausola compromissoria', stato: 'in_corso', materia: 'societario' },
      { id: 'f5', numero: '2025/0003-TRI', oggetto: 'Ricorso avviso di accertamento IVA', stato: 'aperto', materia: 'tributario' },
    ],
    fatture: [
      { id: 'ft4', numero: '2024/0091', data: '2024-12-20', importo: 8500, stato: 'pagata' },
      { id: 'ft5', numero: '2025/0008', data: '2025-02-15', importo: 5200, stato: 'scaduta' },
    ],
    attivita_recenti: [
      { data: '2025-03-12', descrizione: 'Studio ricorso tributario', ore: 4.0 },
      { data: '2025-03-08', descrizione: 'Meeting con CDA Verdi S.r.l.', ore: 1.5 },
    ],
  },
  '3': {
    id: '3', display_name: 'Bianchi Laura', tipo: 'persona_fisica',
    codice_fiscale: 'BNCLRA75B41F205A', stato: 'attivo',
    telefono: '+39 333 4567890', email: 'l.bianchi@email.it',
    pec: 'laura.bianchi@pec.it', indirizzo: 'Corso Vittorio Emanuele 88, 80121 Napoli (NA)',
    note: '', fascicoli_count: 1, rating: 4, created_at: '2024-09-20',
    fascicoli: [
      { id: 'f6', numero: '2024/0072-FAM', oggetto: 'Separazione consensuale', stato: 'in_corso', materia: 'famiglia' },
    ],
    fatture: [
      { id: 'ft6', numero: '2024/0102', data: '2024-10-30', importo: 2000, stato: 'pagata' },
    ],
    attivita_recenti: [
      { data: '2025-03-11', descrizione: 'Preparazione ricorso separazione', ore: 2.5 },
    ],
  },
  '4': {
    id: '4', display_name: 'Alfa S.p.A.', tipo: 'persona_giuridica',
    partita_iva: '98765432109', codice_fiscale: '98765432109', stato: 'attivo',
    telefono: '+39 06 5551234', email: 'legal@alfa.it',
    pec: 'alfa@pec.it', indirizzo: 'Viale Europa 120, 00144 Roma (RM)',
    rappresentante_legale: 'Marco Alfa', note: 'Grande azienda, diversi contenziosi aperti.',
    fascicoli_count: 4, rating: 3, created_at: '2023-03-01',
    fascicoli: [
      { id: 'f7', numero: '2023/0045-CIV', oggetto: 'Inadempimento contrattuale fornitore', stato: 'chiuso_vinto', materia: 'civile' },
      { id: 'f8', numero: '2024/0011-LAV', oggetto: 'Causa lavoro - demansionamento', stato: 'chiuso_perso', materia: 'lavoro' },
      { id: 'f9', numero: '2024/0067-CIV', oggetto: 'Appalto pubblico - esclusione gara', stato: 'in_corso', materia: 'amministrativo' },
      { id: 'f10', numero: '2025/0001-PRI', oggetto: 'Compliance GDPR audit', stato: 'aperto', materia: 'privacy' },
    ],
    fatture: [
      { id: 'ft7', numero: '2024/0033', data: '2024-06-15', importo: 12000, stato: 'pagata' },
      { id: 'ft8', numero: '2024/0099', data: '2024-12-01', importo: 6500, stato: 'pagata' },
      { id: 'ft9', numero: '2025/0015', data: '2025-03-10', importo: 4800, stato: 'emessa' },
    ],
    attivita_recenti: [
      { data: '2025-03-15', descrizione: 'Audit GDPR - analisi trattamenti', ore: 5.0 },
      { data: '2025-03-13', descrizione: 'Udienza TAR Lazio - appalto', ore: 3.0 },
      { data: '2025-03-07', descrizione: 'Call con DPO Alfa S.p.A.', ore: 1.0 },
    ],
  },
  '5': {
    id: '5', display_name: 'Neri Francesco', tipo: 'persona_fisica',
    codice_fiscale: 'NREFNC90C15L219P', stato: 'potenziale',
    telefono: '+39 347 8901234', email: 'f.neri@email.it',
    indirizzo: 'Via Garibaldi 5, 10122 Torino (TO)',
    note: 'Primo contatto il 10/03/2025. Interessato a consulenza tributaria.',
    fascicoli_count: 0, rating: 0, created_at: '2025-03-10',
    fascicoli: [],
    fatture: [],
    attivita_recenti: [],
  },
}

const statoColors: Record<string, 'green' | 'blue' | 'muted' | 'orange' | 'red'> = {
  attivo: 'green', potenziale: 'blue', inattivo: 'muted', ex_cliente: 'orange',
  in_corso: 'blue', aperto: 'green', chiuso_vinto: 'green', chiuso_perso: 'red',
  pagata: 'green', emessa: 'blue', scaduta: 'red',
}

const tabs = ['Panoramica', 'Fascicoli', 'Fatture', 'Attività', 'Documenti', 'Note']

export function ClienteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Panoramica')

  const cliente = mockClienti[id || '']

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle size={48} className="text-gold-400" />
        <h2 className="text-lg font-medium text-text-primary">Cliente non trovato</h2>
        <Button variant="secondary" onClick={() => navigate('/clienti')}>Torna alla lista</Button>
      </div>
    )
  }

  const fatturato = cliente.fatture.reduce((acc: number, f: any) => acc + f.importo, 0)
  const incassato = cliente.fatture.filter((f: any) => f.stato === 'pagata').reduce((acc: number, f: any) => acc + f.importo, 0)
  const oreTotali = cliente.attivita_recenti.reduce((acc: number, a: any) => acc + a.ore, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/clienti')} className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
            <ArrowLeft size={20} className="text-text-muted" />
          </button>
          <div className="w-14 h-14 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-lg font-bold text-gold-400">
            {cliente.display_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h1 className="font-display text-section-title text-text-primary">{cliente.display_name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={statoColors[cliente.stato]} size="sm">{cliente.stato}</Badge>
              <span className="text-xs text-text-muted">
                {cliente.tipo === 'persona_fisica' ? 'Persona Fisica' : 'Persona Giuridica'}
              </span>
              {cliente.rating > 0 && <span className="text-xs text-gold-400">{'★'.repeat(cliente.rating)}{'☆'.repeat(5 - cliente.rating)}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Edit size={16} />}>Modifica</Button>
          <Button variant="gold" icon={<Plus size={16} />} onClick={() => navigate('/fascicoli/nuovo')}>Nuovo Fascicolo</Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Fascicoli" value={cliente.fascicoli_count} icon={<Scale size={18} />} />
        <KPI label="Fatturato" value={`€ ${fatturato.toLocaleString('it-IT')}`} icon={<TrendingUp size={18} />} />
        <KPI label="Incassato" value={`€ ${incassato.toLocaleString('it-IT')}`} icon={<TrendingUp size={18} />} trend={fatturato > 0 ? { value: Math.round(incassato / fatturato * 100), label: 'del fatturato' } : undefined} />
        <KPI label="Ore lavorate" value={oreTotali.toFixed(1)} icon={<Clock size={18} />} />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-subtle overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab ? 'text-gold-400 border-gold-400' : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'Panoramica' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dati Anagrafici */}
            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                {cliente.tipo === 'persona_fisica' ? <User size={16} className="text-gold-400" /> : <Building2 size={16} className="text-gold-400" />}
                Dati Anagrafici
              </h3>
              <div className="space-y-3 text-sm">
                {cliente.codice_fiscale && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Codice Fiscale</span>
                    <span className="font-mono text-text-primary">{cliente.codice_fiscale}</span>
                  </div>
                )}
                {cliente.partita_iva && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Partita IVA</span>
                    <span className="font-mono text-text-primary">{cliente.partita_iva}</span>
                  </div>
                )}
                {cliente.rappresentante_legale && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Rapp. Legale</span>
                    <span className="text-text-primary">{cliente.rappresentante_legale}</span>
                  </div>
                )}
                {cliente.indirizzo && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Indirizzo</span>
                    <span className="text-text-primary text-right max-w-[60%]">{cliente.indirizzo}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Cliente dal</span>
                  <span className="text-text-primary">{new Date(cliente.created_at).toLocaleDateString('it-IT')}</span>
                </div>
              </div>
            </Card>

            {/* Contatti */}
            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Phone size={16} className="text-gold-400" /> Contatti
              </h3>
              <div className="space-y-3 text-sm">
                {cliente.telefono && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Telefono</span>
                    <a href={`tel:${cliente.telefono}`} className="text-gold-400 hover:underline">{cliente.telefono}</a>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Email</span>
                    <a href={`mailto:${cliente.email}`} className="text-gold-400 hover:underline">{cliente.email}</a>
                  </div>
                )}
                {cliente.pec && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">PEC</span>
                    <span className="text-text-primary">{cliente.pec}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Ultimi Fascicoli */}
            <Card className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FileText size={16} className="text-gold-400" /> Fascicoli Recenti
              </h3>
              {cliente.fascicoli.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">Nessun fascicolo associato</p>
              ) : (
                <div className="space-y-2">
                  {cliente.fascicoli.map((f: any) => (
                    <div key={f.id} onClick={() => navigate(`/fascicoli/${f.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary hover:bg-bg-elevated cursor-pointer transition-colors border border-border-subtle">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{f.oggetto}</div>
                        <div className="text-xs text-text-muted mt-0.5">{f.numero} — {f.materia}</div>
                      </div>
                      <Badge variant={statoColors[f.stato] || 'default'} size="sm">{f.stato.replace('_', ' ')}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Note */}
            {cliente.note && (
              <Card className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Note</h3>
                <p className="text-sm text-text-secondary">{cliente.note}</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'Fascicoli' && (
          <div className="space-y-3">
            {cliente.fascicoli.length === 0 ? (
              <Card><p className="text-sm text-text-muted text-center py-8">Nessun fascicolo</p></Card>
            ) : cliente.fascicoli.map((f: any) => (
              <Card key={f.id} hover className="cursor-pointer" onClick={() => navigate(`/fascicoli/${f.id}`)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{f.oggetto}</div>
                    <div className="text-xs text-text-muted mt-1">{f.numero} — {f.materia}</div>
                  </div>
                  <Badge variant={statoColors[f.stato] || 'default'} size="sm">{f.stato.replace('_', ' ')}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'Fatture' && (
          <div className="space-y-3">
            {cliente.fatture.length === 0 ? (
              <Card><p className="text-sm text-text-muted text-center py-8">Nessuna fattura</p></Card>
            ) : cliente.fatture.map((f: any) => (
              <Card key={f.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-text-primary">Fattura {f.numero}</div>
                    <div className="text-xs text-text-muted mt-1">{new Date(f.data).toLocaleDateString('it-IT')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-text-primary">€ {f.importo.toLocaleString('it-IT')}</span>
                    <Badge variant={statoColors[f.stato] || 'default'} size="sm">{f.stato}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'Attività' && (
          <div className="space-y-3">
            {cliente.attivita_recenti.length === 0 ? (
              <Card><p className="text-sm text-text-muted text-center py-8">Nessuna attività registrata</p></Card>
            ) : cliente.attivita_recenti.map((a: any, i: number) => (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{a.descrizione}</div>
                    <div className="text-xs text-text-muted mt-1">{new Date(a.data).toLocaleDateString('it-IT')}</div>
                  </div>
                  <span className="text-sm text-gold-400 font-medium">{a.ore}h</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'Documenti' && (
          <Card><p className="text-sm text-text-muted text-center py-8">Nessun documento caricato per questo cliente</p></Card>
        )}

        {activeTab === 'Note' && (
          <Card>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{cliente.note || 'Nessuna nota.'}</p>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
