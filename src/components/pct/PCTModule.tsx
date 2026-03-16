import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, FileCheck, Search, Shield, Clock, AlertTriangle, CheckCircle, ExternalLink, Download, Eye, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KPI } from '@/components/ui/KPI'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { FileUpload } from '@/components/ui/FileUpload'
import { toast } from 'sonner'

type PCTTab = 'depositi' | 'consultazione' | 'pec' | 'firma'

interface Deposito {
  id: string
  fascicolo: string
  numero_rg: string
  tipo_atto: string
  stato: 'bozza' | 'firmato' | 'inviato' | 'accettato' | 'rifiutato'
  data_invio?: string
  data_accettazione?: string
  esito?: string
  id_deposito?: string
}

const mockDepositi: Deposito[] = [
  { id: '1', fascicolo: '2025/0042-CIV', numero_rg: '1234/2025', tipo_atto: 'Memoria ex art. 183', stato: 'accettato', data_invio: '2025-03-10', data_accettazione: '2025-03-10', id_deposito: 'DEP-2025-04521' },
  { id: '2', fascicolo: '2025/0038-CIV', numero_rg: '5678/2025', tipo_atto: 'Comparsa di risposta', stato: 'inviato', data_invio: '2025-03-15', id_deposito: 'DEP-2025-04899' },
  { id: '3', fascicolo: '2025/0029-TRIB', numero_rg: '9012/2025', tipo_atto: 'Ricorso CTP', stato: 'firmato' },
  { id: '4', fascicolo: '2025/0042-CIV', numero_rg: '1234/2025', tipo_atto: 'Nota di deposito documenti', stato: 'bozza' },
]

const mockPEC = [
  { id: '1', da: 'tribunale.roma@giustiziacert.it', a: 'studio@pec.legalmind.it', oggetto: 'Comunicazione esito deposito DEP-2025-04521', data: '2025-03-10T14:30', letta: true, tipo: 'accettazione' },
  { id: '2', da: 'tribunale.roma@giustiziacert.it', a: 'studio@pec.legalmind.it', oggetto: 'Avviso di fissazione udienza RG 1234/2025', data: '2025-03-14T09:15', letta: true, tipo: 'comunicazione' },
  { id: '3', da: 'controparte@pec.avvlex.it', a: 'studio@pec.legalmind.it', oggetto: 'Notifica atto di citazione RG 3456/2025', data: '2025-03-15T11:00', letta: false, tipo: 'notifica' },
  { id: '4', da: 'tribunale.milano@giustiziacert.it', a: 'studio@pec.legalmind.it', oggetto: 'Esito deposito rifiutato — formato non conforme', data: '2025-03-16T08:45', letta: false, tipo: 'rifiuto' },
]

const statoColors: Record<string, 'muted' | 'gold' | 'blue' | 'green' | 'red'> = {
  bozza: 'muted', firmato: 'gold', inviato: 'blue', accettato: 'green', rifiutato: 'red',
}

const pecTipoColors: Record<string, 'green' | 'blue' | 'red' | 'muted'> = {
  accettazione: 'green', comunicazione: 'blue', notifica: 'gold' as any, rifiuto: 'red',
}

export function PCTModule() {
  const [activeTab, setActiveTab] = useState<PCTTab>('depositi')
  const [showNuovoDeposito, setShowNuovoDeposito] = useState(false)
  const [searchRG, setSearchRG] = useState('')

  const tabs: { id: PCTTab; label: string; icon: typeof Mail }[] = [
    { id: 'depositi', label: 'Depositi Telematici', icon: Send },
    { id: 'consultazione', label: 'Consultazione Registri', icon: Search },
    { id: 'pec', label: 'PEC Integrata', icon: Mail },
    { id: 'firma', label: 'Firma Digitale', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Processo Civile Telematico</h1>
          <p className="text-sm text-text-secondary mt-1">Depositi, consultazioni, PEC e firma digitale</p>
        </div>
        <Button variant="gold" icon={<Send size={16} />} onClick={() => setShowNuovoDeposito(true)}>Nuovo Deposito</Button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Depositi Mese" value="12" icon={<Send size={18} />} trend={{ value: 20 }} variant="gold" />
        <KPI label="Accettati" value="10" icon={<CheckCircle size={18} />} trend={{ value: 85, label: '% successo' }} />
        <KPI label="PEC Non Lette" value="2" icon={<Mail size={18} />} trend={{ value: -15 }} />
        <KPI label="Da Firmare" value="3" icon={<Shield size={18} />} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${activeTab === tab.id ? 'text-gold-400 border-b-2 border-gold-400' : 'text-text-muted hover:text-text-secondary'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'depositi' && (
          <div className="space-y-3">
            {mockDepositi.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card hover padding="none" className="cursor-pointer">
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-1.5 h-14 rounded-full ${d.stato === 'accettato' ? 'bg-accent-green' : d.stato === 'rifiutato' ? 'bg-accent-red' : d.stato === 'inviato' ? 'bg-accent-blue' : 'bg-text-muted'}`} />
                    <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center shrink-0">
                      <FileCheck size={18} className="text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-text-primary">{d.tipo_atto}</h3>
                        <Badge variant={statoColors[d.stato]} size="sm" dot>{d.stato}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="font-mono">{d.fascicolo}</span>
                        <span>RG: {d.numero_rg}</span>
                        {d.id_deposito && <span className="text-gold-400">{d.id_deposito}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {d.data_invio && <div className="text-xs text-text-secondary">{new Date(d.data_invio).toLocaleDateString('it-IT')}</div>}
                      {d.stato === 'bozza' && <Button size="sm" variant="gold" icon={<Shield size={12} />}>Firma & Invia</Button>}
                      {d.stato === 'firmato' && <Button size="sm" variant="primary" icon={<Send size={12} />}>Invia</Button>}
                      {d.stato === 'accettato' && <Button size="sm" variant="ghost" icon={<Download size={12} />}>Ricevuta</Button>}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'consultazione' && (
          <Card>
            <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Consultazione Registri di Cancelleria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Select label="Ufficio Giudiziario" options={[
                { value: 'trib-roma', label: 'Tribunale di Roma' },
                { value: 'trib-milano', label: 'Tribunale di Milano' },
                { value: 'trib-napoli', label: 'Tribunale di Napoli' },
                { value: 'cda-roma', label: 'Corte d\'Appello di Roma' },
                { value: 'ctp-roma', label: 'CTP Roma' },
              ]} placeholder="Seleziona ufficio" />
              <Input label="Numero RG" placeholder="1234/2025" value={searchRG} onChange={e => setSearchRG(e.target.value)} />
              <div className="flex items-end">
                <Button variant="gold" icon={<Search size={16} />} fullWidth>Consulta</Button>
              </div>
            </div>
            <div className="p-8 bg-bg-tertiary rounded-lg text-center">
              <Search size={40} className="mx-auto text-text-muted mb-3" />
              <p className="text-sm text-text-secondary">Inserisci l'ufficio giudiziario e il numero RG per consultare il fascicolo telematico</p>
              <p className="text-xs text-text-muted mt-2">Integrazione con SICID/SIECIC/SIGP via web services Giustizia</p>
            </div>
          </Card>
        )}

        {activeTab === 'pec' && (
          <div className="space-y-3">
            <Card padding="sm" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gold-400" />
                <span className="text-sm text-text-primary font-medium">studio@pec.legalmind.it</span>
                <Badge variant="green" size="sm">Connessa</Badge>
              </div>
              <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />}>Sincronizza</Button>
            </Card>

            {mockPEC.map((pec, i) => (
              <motion.div key={pec.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card hover padding="none" className={`cursor-pointer ${!pec.letta ? 'border-l-2 border-l-gold-400' : ''}`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={pecTipoColors[pec.tipo] || 'muted'} size="sm">{pec.tipo}</Badge>
                        {!pec.letta && <span className="w-2 h-2 rounded-full bg-gold-400" />}
                      </div>
                      <span className="text-[10px] text-text-muted">{new Date(pec.data).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">{pec.oggetto}</h4>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>Da: {pec.da}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'firma' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Dispositivo di Firma</h3>
              <div className="p-6 bg-bg-tertiary rounded-lg border border-border-subtle">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center">
                    <Shield size={24} className="text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">Smart Card Infocert</div>
                    <div className="text-xs text-text-muted">CNS — Aruba PEC S.p.A.</div>
                    <Badge variant="green" size="sm" className="mt-1">Attiva</Badge>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-text-secondary">
                  <div className="flex justify-between"><span>Titolare:</span><span className="text-text-primary">Avv. Marco Bianchi</span></div>
                  <div className="flex justify-between"><span>Ente Certificatore:</span><span className="text-text-primary">InfoCert S.p.A.</span></div>
                  <div className="flex justify-between"><span>Scadenza:</span><span className="text-text-primary">15/12/2026</span></div>
                  <div className="flex justify-between"><span>Tipo firma:</span><span className="text-text-primary">CAdES (P7M)</span></div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" fullWidth>Verifica Certificato</Button>
                <Button variant="secondary" size="sm" fullWidth>Cambia PIN</Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Documenti da Firmare</h3>
              <div className="space-y-3">
                {mockDepositi.filter(d => d.stato === 'bozza').map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg border border-border-subtle">
                    <div>
                      <div className="text-sm text-text-primary">{d.tipo_atto}</div>
                      <div className="text-xs text-text-muted font-mono">{d.fascicolo}</div>
                    </div>
                    <Button size="sm" variant="gold" icon={<Shield size={12} />}>Firma P7M</Button>
                  </div>
                ))}
                {mockDepositi.filter(d => d.stato === 'bozza').length === 0 && (
                  <p className="text-sm text-text-muted text-center py-6">Nessun documento in attesa di firma</p>
                )}
              </div>
              <div className="mt-4 p-3 bg-gold-400/5 border border-border-gold rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-gold-400" />
                  <span className="text-xs font-medium text-gold-400">Formati supportati</span>
                </div>
                <p className="text-xs text-text-secondary">CAdES (.p7m) • PAdES (PDF firmato) • XAdES (XML firmato)</p>
              </div>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Modal Nuovo Deposito */}
      <Modal open={showNuovoDeposito} onClose={() => setShowNuovoDeposito(false)} title="Nuovo Deposito Telematico" size="lg">
        <div className="space-y-4">
          <Select label="Fascicolo" options={[
            { value: '2025/0042-CIV', label: '2025/0042-CIV — Risarcimento danni' },
            { value: '2025/0038-CIV', label: '2025/0038-CIV — Opposizione DI' },
            { value: '2025/0029-TRIB', label: '2025/0029-TRIB — Ricorso CTP' },
          ]} placeholder="Seleziona fascicolo" />
          <Select label="Tipo Atto" options={[
            { value: 'atto_citazione', label: 'Atto di Citazione' },
            { value: 'comparsa_risposta', label: 'Comparsa di Risposta' },
            { value: 'memoria_183', label: 'Memoria ex art. 183' },
            { value: 'ricorso', label: 'Ricorso' },
            { value: 'istanza', label: 'Istanza' },
            { value: 'nota_deposito', label: 'Nota di Deposito' },
          ]} placeholder="Seleziona tipo atto" />
          <div>
            <label className="text-label uppercase text-text-secondary tracking-widest mb-1.5 block">Atto Principale (PDF)</label>
            <FileUpload bucket="documenti" folder="depositi" accept={['application/pdf']} multiple={false} />
          </div>
          <div>
            <label className="text-label uppercase text-text-secondary tracking-widest mb-1.5 block">Allegati</label>
            <FileUpload bucket="documenti" folder="depositi/allegati" />
          </div>
          <div className="p-3 bg-gold-400/5 border border-border-gold rounded-lg text-xs text-text-secondary">
            <p className="font-medium text-gold-400 mb-1">Requisiti PCT:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Atto principale in PDF/A firmato digitalmente (P7M o PAdES)</li>
              <li>Allegati in PDF, max 30MB totali</li>
              <li>Procura alle liti scansionata e firmata</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowNuovoDeposito(false)}>Annulla</Button>
            <Button variant="gold" icon={<Send size={16} />} onClick={() => { setShowNuovoDeposito(false); toast.success('Deposito creato in bozza — firma e invia') }}>
              Crea Deposito
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
