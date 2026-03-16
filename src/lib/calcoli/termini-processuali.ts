import { calcolaTermineProcessuale, giorniAllaScadenza } from '@/lib/utils/date-utils'

export interface TermineProcessuale {
  codice: string
  nome: string
  riferimento: string
  giorni: number
  tipo: 'perentorio' | 'ordinatorio'
  sospensioneFeriale: boolean
  note?: string
}

// Termini processuali civili più comuni
export const TERMINI_CIVILI: TermineProcessuale[] = [
  { codice: 'CPC_163BIS', nome: 'Comparizione convenuto', riferimento: 'art. 163-bis c.p.c.', giorni: 120, tipo: 'perentorio', sospensioneFeriale: true, note: 'Tra notifica e udienza' },
  { codice: 'CPC_166', nome: 'Costituzione attore', riferimento: 'art. 166 c.p.c.', giorni: 10, tipo: 'perentorio', sospensioneFeriale: true, note: '10 gg prima dell\'udienza' },
  { codice: 'CPC_167', nome: 'Costituzione convenuto', riferimento: 'art. 167 c.p.c.', giorni: 20, tipo: 'perentorio', sospensioneFeriale: true, note: '20 gg prima dell\'udienza' },
  { codice: 'CPC_183_6_1', nome: 'Memoria ex art. 183 VI co. n.1', riferimento: 'art. 183 VI co. n.1 c.p.c.', giorni: 30, tipo: 'perentorio', sospensioneFeriale: true },
  { codice: 'CPC_183_6_2', nome: 'Memoria ex art. 183 VI co. n.2', riferimento: 'art. 183 VI co. n.2 c.p.c.', giorni: 30, tipo: 'perentorio', sospensioneFeriale: true, note: 'Dalla scadenza n.1' },
  { codice: 'CPC_183_6_3', nome: 'Memoria ex art. 183 VI co. n.3', riferimento: 'art. 183 VI co. n.3 c.p.c.', giorni: 20, tipo: 'perentorio', sospensioneFeriale: true, note: 'Dalla scadenza n.2' },
  { codice: 'CPC_325', nome: 'Termine appello', riferimento: 'art. 325 c.p.c.', giorni: 30, tipo: 'perentorio', sospensioneFeriale: true, note: 'Dalla notifica sentenza' },
  { codice: 'CPC_325_LUNGO', nome: 'Termine lungo appello', riferimento: 'art. 327 c.p.c.', giorni: 180, tipo: 'perentorio', sospensioneFeriale: true, note: 'Dalla pubblicazione sentenza' },
  { codice: 'CPC_641', nome: 'Opposizione decreto ingiuntivo', riferimento: 'art. 641 c.p.c.', giorni: 40, tipo: 'perentorio', sospensioneFeriale: true },
  { codice: 'CPC_480', nome: 'Termine per precetto', riferimento: 'art. 480 c.p.c.', giorni: 10, tipo: 'perentorio', sospensioneFeriale: false, note: 'Minimo dalla notifica' },
]

export function calcolaTermine(
  dataInizio: Date,
  termine: TermineProcessuale
): {
  termine: TermineProcessuale
  dataScadenza: Date
  giorniRimanenti: number
  scaduto: boolean
  critico: boolean
} {
  const dataScadenza = calcolaTermineProcessuale(dataInizio, termine.giorni, {
    sospensioneFeriale: termine.sospensioneFeriale,
  })

  const giorniRim = giorniAllaScadenza(dataScadenza)

  return {
    termine,
    dataScadenza,
    giorniRimanenti: giorniRim,
    scaduto: giorniRim < 0,
    critico: giorniRim >= 0 && giorniRim <= 15,
  }
}
