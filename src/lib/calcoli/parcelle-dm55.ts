// DM 55/2014 aggiornato DM 147/2022 — Parametri forensi

export const SCAGLIONI = [
  { id: 1, min: 0, max: 1100, label: 'Fino a €1.100' },
  { id: 2, min: 1100.01, max: 5200, label: 'Da €1.100,01 a €5.200' },
  { id: 3, min: 5200.01, max: 26000, label: 'Da €5.200,01 a €26.000' },
  { id: 4, min: 26000.01, max: 52000, label: 'Da €26.000,01 a €52.000' },
  { id: 5, min: 52000.01, max: 260000, label: 'Da €52.000,01 a €260.000' },
  { id: 6, min: 260000.01, max: 520000, label: 'Da €260.000,01 a €520.000' },
  { id: 7, min: 520000.01, max: Infinity, label: 'Oltre €520.000' },
] as const

export interface ParametriFase {
  studio: number
  introduttiva: number
  istruttoria: number
  decisoria: number
}

// Parametri medi per scaglione (civile contenzioso)
export const PARAMETRI_CIVILE: Record<number, ParametriFase> = {
  1: { studio: 135, introduttiva: 135, istruttoria: 200, decisoria: 135 },
  2: { studio: 405, introduttiva: 270, istruttoria: 540, decisoria: 405 },
  3: { studio: 810, introduttiva: 540, istruttoria: 1215, decisoria: 810 },
  4: { studio: 1350, introduttiva: 810, istruttoria: 1620, decisoria: 1350 },
  5: { studio: 2430, introduttiva: 1350, istruttoria: 2835, decisoria: 2430 },
  6: { studio: 3645, introduttiva: 1755, istruttoria: 4050, decisoria: 3645 },
  7: { studio: 5265, introduttiva: 2565, istruttoria: 5670, decisoria: 5265 },
}

// Maggiorazioni e riduzioni
export const MAGGIORAZIONI = {
  questione_particolare_complessita: 0.80,    // +80%
  numero_parti_superiore_2: 0.20,             // +20% per ogni parte oltre la seconda, max +100%
  risultato_ottenuto: 0.30,                   // +30% se risultato particolarmente positivo
  urgenza: 0.30,                              // +30%
  impegno_probatorio_rilevante: 0.30,         // +30%
} as const

export const RIDUZIONI = {
  causa_semplice: -0.30,                      // -30%
  mancata_fase_istruttoria: -1.00,            // -100% della fase
  definizione_anticipata: -0.20,              // -20%
} as const

export function getScaglione(valoreCausa: number): typeof SCAGLIONI[number] | undefined {
  return SCAGLIONI.find((s) => valoreCausa >= s.min && valoreCausa <= s.max)
}

export function calcolaParametriBase(
  valoreCausa: number,
  fasi: ('studio' | 'introduttiva' | 'istruttoria' | 'decisoria')[]
): {
  scaglione: typeof SCAGLIONI[number]
  parametri: Partial<ParametriFase>
  totaleBase: number
} {
  const scaglione = getScaglione(valoreCausa)
  if (!scaglione) {
    return { scaglione: SCAGLIONI[0], parametri: {}, totaleBase: 0 }
  }

  const parametriCompleti = PARAMETRI_CIVILE[scaglione.id]
  const parametri: Partial<ParametriFase> = {}
  let totaleBase = 0

  for (const fase of fasi) {
    parametri[fase] = parametriCompleti[fase]
    totaleBase += parametriCompleti[fase]
  }

  return { scaglione, parametri, totaleBase }
}

export function calcolaParcella(
  valoreCausa: number,
  fasi: ('studio' | 'introduttiva' | 'istruttoria' | 'decisoria')[],
  maggiorazioni: string[] = [],
  riduzioni: string[] = [],
  speseGenerali = 0.15 // 15% spese generali
): {
  scaglione: typeof SCAGLIONI[number]
  dettaglio: { fase: string; importo: number }[]
  totaleCompenso: number
  speseGeneraliImporto: number
  cpa: number
  totaleImponibile: number
  iva: number
  totaleDocumento: number
  ritenutaAcconto: number
  totaleDovuto: number
} {
  const { scaglione, parametri, totaleBase } = calcolaParametriBase(valoreCausa, fasi)

  // Applica maggiorazioni
  let moltiplicatoreMagg = 1
  for (const m of maggiorazioni) {
    const val = MAGGIORAZIONI[m as keyof typeof MAGGIORAZIONI]
    if (val) moltiplicatoreMagg += val
  }

  // Applica riduzioni
  let moltiplicatoreRid = 1
  for (const r of riduzioni) {
    const val = RIDUZIONI[r as keyof typeof RIDUZIONI]
    if (val) moltiplicatoreRid += val
  }

  const moltiplicatore = Math.max(0, moltiplicatoreMagg * moltiplicatoreRid)

  const dettaglio = Object.entries(parametri).map(([fase, importo]) => ({
    fase,
    importo: Math.round((importo || 0) * moltiplicatore * 100) / 100,
  }))

  const totaleCompenso = dettaglio.reduce((sum, d) => sum + d.importo, 0)
  const speseGeneraliImporto = Math.round(totaleCompenso * speseGenerali * 100) / 100
  const cpa = Math.round((totaleCompenso + speseGeneraliImporto) * 0.04 * 100) / 100
  const totaleImponibile = totaleCompenso + speseGeneraliImporto + cpa
  const iva = Math.round(totaleImponibile * 0.22 * 100) / 100
  const totaleDocumento = Math.round((totaleImponibile + iva) * 100) / 100
  const ritenutaAcconto = Math.round(totaleCompenso * 0.20 * 100) / 100
  const totaleDovuto = Math.round((totaleDocumento - ritenutaAcconto) * 100) / 100

  return {
    scaglione,
    dettaglio,
    totaleCompenso,
    speseGeneraliImporto,
    cpa,
    totaleImponibile,
    iva,
    totaleDocumento,
    ritenutaAcconto,
    totaleDovuto,
  }
}
