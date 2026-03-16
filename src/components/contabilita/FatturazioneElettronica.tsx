import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileSpreadsheet, Send, Download, CheckCircle, Clock, AlertTriangle, Eye, RefreshCw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KPI } from '@/components/ui/KPI'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { toast } from 'sonner'

interface FatturaElettronica {
  id: string
  numero: string
  cliente: string
  partita_iva: string
  totale: number
  iva: number
  imponibile: number
  stato_sdi: 'da_inviare' | 'inviata' | 'consegnata' | 'accettata' | 'rifiutata' | 'scartata' | 'non_consegnata'
  data_emissione: string
  data_invio_sdi?: string
  id_sdi?: string
  codice_destinatario: string
  tipo_documento: 'TD01' | 'TD02' | 'TD04' | 'TD06' | 'TD24'
}

const mockFattureE: FatturaElettronica[] = [
  { id: '1', numero: 'FPA/2025/0012', cliente: 'Rossi Mario', partita_iva: '', totale: 10370, iva: 1870, imponibile: 8500, stato_sdi: 'consegnata', data_emissione: '2025-03-01', data_invio_sdi: '2025-03-01', id_sdi: 'IT01234567890_ABCDE', codice_destinatario: '0000000', tipo_documento: 'TD01' },
  { id: '2', numero: 'FPA/2025/0011', cliente: 'Verdi S.r.l.', partita_iva: '12345678901', totale: 5124, iva: 924, imponibile: 4200, stato_sdi: 'accettata', data_emissione: '2025-02-28', data_invio_sdi: '2025-02-28', id_sdi: 'IT01234567890_FGHIJ', codice_destinatario: 'SUBM70N', tipo_documento: 'TD01' },
  { id: '3', numero: 'FPA/2025/0010', cliente: 'Alfa S.p.A.', partita_iva: '98765432109', totale: 8296, iva: 1496, imponibile: 6800, stato_sdi: 'inviata', data_emissione: '2025-02-20', data_invio_sdi: '2025-02-20', id_sdi: 'IT01234567890_KLMNO', codice_destinatario: 'M5UXCR1', tipo_documento: 'TD06' },
  { id: '4', numero: 'FPA/2025/0009', cliente: 'Bianchi Laura', partita_iva: '', totale: 2928, iva: 528, imponibile: 2400, stato_sdi: 'scartata', data_emissione: '2025-01-15', codice_destinatario: '0000000', tipo_documento: 'TD01' },
  { id: '5', numero: 'NC/2025/0001', cliente: 'Neri Francesco', partita_iva: '', totale: -1220, iva: -220, imponibile: -1000, stato_sdi: 'da_inviare', data_emissione: '2025-03-14', codice_destinatario: '0000000', tipo_documento: 'TD04' },
]

const sdiStato: Record<string, { label: string; variant: 'muted' | 'blue' | 'green' | 'gold' | 'red' | 'orange' }> = {
  da_inviare: { label: 'Da Inviare', variant: 'muted' },
  inviata: { label: 'Inviata SdI', variant: 'blue' },
  consegnata: { label: 'Consegnata', variant: 'gold' },
  accettata: { label: 'Accettata', variant: 'green' },
  rifiutata: { label: 'Rifiutata', variant: 'red' },
  scartata: { label: 'Scartata', variant: 'red' },
  non_consegnata: { label: 'Non Consegnata', variant: 'orange' },
}

const tipiDocumento = [
  { value: 'TD01', label: 'TD01 — Fattura' },
  { value: 'TD02', label: 'TD02 — Acconto/Anticipo su fattura' },
  { value: 'TD04', label: 'TD04 — Nota di Credito' },
  { value: 'TD06', label: 'TD06 — Parcella' },
  { value: 'TD24', label: 'TD24 — Fattura Differita' },
]

export function FatturazioneElettronica() {
  const [showNuova, setShowNuova] = useState(false)
  const [selectedFattura, setSelectedFattura] = useState<FatturaElettronica | null>(null)

  const generateXML = (fattura: FatturaElettronica) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente><IdPaese>IT</IdPaese><IdCodice>01234567890</IdCodice></IdTrasmittente>
      <ProgressivoInvio>${fattura.numero.replace(/\//g, '')}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${fattura.codice_destinatario}</CodiceDestinatario>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA><IdPaese>IT</IdPaese><IdCodice>01234567890</IdCodice></IdFiscaleIVA>
        <Anagrafica><Denominazione>Studio Legale LegalMind</Denominazione></Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        ${fattura.partita_iva ? `<IdFiscaleIVA><IdPaese>IT</IdPaese><IdCodice>${fattura.partita_iva}</IdCodice></IdFiscaleIVA>` : ''}
        <Anagrafica><Denominazione>${fattura.cliente}</Denominazione></Anagrafica>
      </DatiAnagrafici>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>${fattura.tipo_documento}</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${fattura.data_emissione}</Data>
        <Numero>${fattura.numero}</Numero>
        <ImportoTotaleDocumento>${fattura.totale.toFixed(2)}</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <Descrizione>Prestazione professionale legale</Descrizione>
        <PrezzoUnitario>${fattura.imponibile.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${fattura.imponibile.toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>
      <DatiRiepilogo>
        <AliquotaIVA>22.00</AliquotaIVA>
        <ImponibileImporto>${fattura.imponibile.toFixed(2)}</ImponibileImporto>
        <Imposta>${fattura.iva.toFixed(2)}</Imposta>
      </DatiRiepilogo>
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>MP05</ModalitaPagamento>
        <ImportoPagamento>${fattura.totale.toFixed(2)}</ImportoPagamento>
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</p:FatturaElettronica>`

    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fattura.id_sdi || fattura.numero.replace(/\//g, '_')}.xml`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('XML FatturaPA generato')
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-section-title text-text-primary">Fatturazione Elettronica</h1>
          <p className="text-sm text-text-secondary mt-1">Gestione FatturaPA, invio SdI, conservazione digitale</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<RefreshCw size={16} />}>Sincronizza SdI</Button>
          <Button variant="gold" icon={<Plus size={16} />} onClick={() => setShowNuova(true)}>Nuova Fattura Elettronica</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Emesse YTD" value="45" icon={<FileSpreadsheet size={18} />} variant="gold" trend={{ value: 12 }} />
        <KPI label="Consegnate" value="42" icon={<CheckCircle size={18} />} trend={{ value: 93, label: '% tasso' }} />
        <KPI label="In Attesa SdI" value="2" icon={<Clock size={18} />} />
        <KPI label="Scartate/Rifiutate" value="1" icon={<AlertTriangle size={18} />} trend={{ value: -50, label: 'vs mese prec.' }} />
      </div>

      <Card padding="none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Numero</th>
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Tipo</th>
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Cliente</th>
              <th className="text-right text-label text-text-muted tracking-widest py-3 px-5">Totale</th>
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Stato SdI</th>
              <th className="text-left text-label text-text-muted tracking-widest py-3 px-5">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {mockFattureE.map(f => {
              const stato = sdiStato[f.stato_sdi]
              return (
                <tr key={f.id} className="border-b border-border-subtle hover:bg-bg-tertiary transition-colors">
                  <td className="py-3 px-5 text-sm font-mono text-gold-400">{f.numero}</td>
                  <td className="py-3 px-5"><Badge variant="default" size="sm">{f.tipo_documento}</Badge></td>
                  <td className="py-3 px-5 text-sm text-text-primary">{f.cliente}</td>
                  <td className="py-3 px-5 text-sm text-text-primary text-right font-medium">€{Math.abs(f.totale).toLocaleString('it-IT', { minimumFractionDigits: 2 })}{f.totale < 0 ? ' (NC)' : ''}</td>
                  <td className="py-3 px-5"><Badge variant={stato.variant} size="sm" dot>{stato.label}</Badge></td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => generateXML(f)} className="p-1.5 rounded text-text-muted hover:text-gold-400" title="Scarica XML"><Download size={14} /></button>
                      <button onClick={() => setSelectedFattura(f)} className="p-1.5 rounded text-text-muted hover:text-accent-blue" title="Anteprima"><Eye size={14} /></button>
                      {f.stato_sdi === 'da_inviare' && <Button size="sm" variant="gold" icon={<Send size={12} />}>Invia SdI</Button>}
                      {f.stato_sdi === 'scartata' && <Button size="sm" variant="danger" icon={<RefreshCw size={12} />}>Reinvia</Button>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold text-text-primary mb-3">Conservazione Digitale a Norma</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-bg-tertiary rounded-lg border border-border-subtle">
            <div className="text-kpi gold-text">45</div>
            <p className="text-xs text-text-muted mt-1">Documenti conservati 2025</p>
          </div>
          <div className="p-4 bg-bg-tertiary rounded-lg border border-border-subtle">
            <div className="text-lg font-bold text-accent-green">Conforme</div>
            <p className="text-xs text-text-muted mt-1">Stato conservazione</p>
          </div>
          <div className="p-4 bg-bg-tertiary rounded-lg border border-border-subtle">
            <div className="text-lg font-bold text-text-primary">Aruba PEC</div>
            <p className="text-xs text-text-muted mt-1">Provider conservazione</p>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">Conservazione conforme al CAD (D.Lgs. 82/2005) e DPCM 3/12/2013. Responsabile conservazione: Avv. Marco Bianchi</p>
      </Card>

      {/* Modal Nuova Fattura */}
      <Modal open={showNuova} onClose={() => setShowNuova(false)} title="Nuova Fattura Elettronica" size="lg">
        <div className="space-y-4">
          <Select label="Tipo Documento" options={tipiDocumento} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cliente / Cessionario" placeholder="Cerca cliente..." />
            <Input label="Codice Destinatario / PEC" placeholder="0000000 o PEC@pec.it" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Imponibile (€)" type="number" placeholder="0.00" />
            <Input label="Aliquota IVA (%)" type="number" placeholder="22" />
            <Input label="Cassa Previdenza (%)" type="number" placeholder="4" />
          </div>
          <Input label="Descrizione Prestazione" placeholder="Prestazione professionale legale..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Modalità Pagamento" options={[
              { value: 'MP05', label: 'MP05 — Bonifico' },
              { value: 'MP01', label: 'MP01 — Contanti' },
              { value: 'MP08', label: 'MP08 — Carta di pagamento' },
            ]} />
            <Input label="IBAN" placeholder="IT60X0542811101000000123456" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowNuova(false)}>Annulla</Button>
            <Button variant="gold" icon={<FileSpreadsheet size={16} />} onClick={() => { setShowNuova(false); toast.success('Fattura elettronica creata in bozza') }}>
              Crea Fattura
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Anteprima */}
      <Modal open={!!selectedFattura} onClose={() => setSelectedFattura(null)} title={`Anteprima — ${selectedFattura?.numero}`} size="lg">
        {selectedFattura && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-text-muted">Tipo:</span> <span className="text-text-primary">{tipiDocumento.find(t => t.value === selectedFattura.tipo_documento)?.label}</span></div>
              <div><span className="text-text-muted">Data:</span> <span className="text-text-primary">{new Date(selectedFattura.data_emissione).toLocaleDateString('it-IT')}</span></div>
              <div><span className="text-text-muted">Cliente:</span> <span className="text-text-primary">{selectedFattura.cliente}</span></div>
              <div><span className="text-text-muted">P.IVA:</span> <span className="text-text-primary font-mono">{selectedFattura.partita_iva || 'Privato'}</span></div>
              <div><span className="text-text-muted">Cod. Dest.:</span> <span className="text-text-primary font-mono">{selectedFattura.codice_destinatario}</span></div>
              <div><span className="text-text-muted">ID SdI:</span> <span className="text-gold-400 font-mono">{selectedFattura.id_sdi || '—'}</span></div>
            </div>
            <div className="border-t border-border-subtle pt-4">
              <div className="flex justify-between text-sm mb-1"><span className="text-text-muted">Imponibile</span><span className="text-text-primary">€{selectedFattura.imponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm mb-1"><span className="text-text-muted">IVA 22%</span><span className="text-text-primary">€{selectedFattura.iva.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm font-bold border-t border-border-subtle pt-2 mt-2"><span className="text-text-primary">Totale</span><span className="gold-text">€{selectedFattura.totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" icon={<Download size={14} />} onClick={() => generateXML(selectedFattura)} fullWidth>Scarica XML</Button>
              <Button variant="gold" icon={<Eye size={14} />} fullWidth>Visualizza PDF</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
