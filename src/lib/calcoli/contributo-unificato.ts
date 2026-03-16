// Contributo unificato — DPR 115/2002 (aggiornato)

interface ScaglioneContributo {
  min: number
  max: number
  importo: number
}

const SCAGLIONI_CIVILE: ScaglioneContributo[] = [
  { min: 0, max: 1100, importo: 43 },
  { min: 1100.01, max: 5200, importo: 98 },
  { min: 5200.01, max: 26000, importo: 237 },
  { min: 26000.01, max: 52000, importo: 518 },
  { min: 52000.01, max: 260000, importo: 759 },
  { min: 260000.01, max: 520000, importo: 1214 },
  { min: 520000.01, max: Infinity, importo: 1686 },
]

const SCAGLIONI_LAVORO: ScaglioneContributo[] = [
  { min: 0, max: Infinity, importo: 0 }, // Esente per il lavoratore
]

export function calcolaContributoUnificato(
  valoreCausa: number,
  tipo: 'civile' | 'lavoro' | 'appello' | 'cassazione' | 'esecuzione' = 'civile'
): {
  importo: number
  marcaDaBollo: number
  totale: number
  note: string
} {
  let importo = 0
  let note = ''

  if (tipo === 'lavoro') {
    importo = 0
    note = 'Esente per il lavoratore (art. 10 DPR 115/2002)'
  } else if (tipo === 'esecuzione') {
    importo = valoreCausa <= 2500 ? 43 : valoreCausa <= 25000 ? 139 : 278
    note = 'Processo esecutivo'
  } else {
    const scaglione = SCAGLIONI_CIVILE.find((s) => valoreCausa >= s.min && valoreCausa <= s.max)
    importo = scaglione?.importo || 43

    if (tipo === 'appello') {
      importo = Math.round(importo * 1.5)
      note = 'Maggiorazione 50% per grado di appello'
    } else if (tipo === 'cassazione') {
      importo = Math.round(importo * 2)
      note = 'Raddoppio per ricorso in Cassazione'
    }
  }

  const marcaDaBollo = 27 // Marca da bollo per atti giudiziari
  return { importo, marcaDaBollo, totale: importo + marcaDaBollo, note }
}
