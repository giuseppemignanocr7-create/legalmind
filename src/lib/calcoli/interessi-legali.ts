// Tassi di interesse legale (art. 1284 c.c.)

const TASSI_INTERESSE_LEGALE: { anno: number; tasso: number }[] = [
  { anno: 2025, tasso: 2.0 },
  { anno: 2024, tasso: 2.5 },
  { anno: 2023, tasso: 5.0 },
  { anno: 2022, tasso: 1.25 },
  { anno: 2021, tasso: 0.01 },
  { anno: 2020, tasso: 0.05 },
  { anno: 2019, tasso: 0.8 },
  { anno: 2018, tasso: 0.3 },
  { anno: 2017, tasso: 0.1 },
  { anno: 2016, tasso: 0.2 },
  { anno: 2015, tasso: 0.5 },
]

export function getTassoInteresseLegale(anno: number): number {
  const entry = TASSI_INTERESSE_LEGALE.find((t) => t.anno === anno)
  return entry?.tasso || 2.0
}

export function calcolaInteressiLegali(
  capitale: number,
  dataInizio: Date,
  dataFine: Date
): {
  interessi: number
  dettaglio: { anno: number; giorni: number; tasso: number; interesse: number }[]
  totale: number
} {
  const dettaglio: { anno: number; giorni: number; tasso: number; interesse: number }[] = []
  let totaleInteressi = 0

  let currentDate = new Date(dataInizio)
  const endDate = new Date(dataFine)

  while (currentDate < endDate) {
    const anno = currentDate.getFullYear()
    const fineAnno = new Date(anno, 11, 31)
    const periodoFine = fineAnno < endDate ? fineAnno : endDate

    const giorni = Math.ceil((periodoFine.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    const tasso = getTassoInteresseLegale(anno)
    const interesse = Math.round(capitale * (tasso / 100) * (giorni / 365) * 100) / 100

    dettaglio.push({ anno, giorni, tasso, interesse })
    totaleInteressi += interesse

    currentDate = new Date(anno + 1, 0, 1)
  }

  return {
    interessi: Math.round(totaleInteressi * 100) / 100,
    dettaglio,
    totale: Math.round((capitale + totaleInteressi) * 100) / 100,
  }
}
