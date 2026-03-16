const FESTIVITA_FISSE = [
  { month: 1, day: 1 },   // Capodanno
  { month: 1, day: 6 },   // Epifania
  { month: 4, day: 25 },  // Liberazione
  { month: 5, day: 1 },   // Festa del Lavoro
  { month: 6, day: 2 },   // Festa della Repubblica
  { month: 8, day: 15 },  // Ferragosto
  { month: 11, day: 1 },  // Ognissanti
  { month: 12, day: 8 },  // Immacolata
  { month: 12, day: 25 }, // Natale
  { month: 12, day: 26 }, // Santo Stefano
]

function calcolaPasqua(anno: number): Date {
  const a = anno % 19
  const b = Math.floor(anno / 100)
  const c = anno % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(anno, month - 1, day)
}

export function isFestivo(date: Date): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dow = date.getDay()

  if (dow === 0) return true // Domenica

  for (const f of FESTIVITA_FISSE) {
    if (f.month === month && f.day === day) return true
  }

  const pasqua = calcolaPasqua(date.getFullYear())
  const lunediAngelo = new Date(pasqua)
  lunediAngelo.setDate(lunediAngelo.getDate() + 1)

  if (date.getMonth() === pasqua.getMonth() && date.getDate() === pasqua.getDate()) return true
  if (date.getMonth() === lunediAngelo.getMonth() && date.getDate() === lunediAngelo.getDate()) return true

  return false
}

export function isInSospensioneFeriale(date: Date): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return month === 8 && day >= 1 && day <= 31
}

export function calcolaTermineProcessuale(
  dataInizio: Date,
  giorni: number,
  options: {
    sospensioneFeriale?: boolean
    escludiFestivi?: boolean
  } = {}
): Date {
  const { sospensioneFeriale = true, escludiFestivi = false } = options
  let result = new Date(dataInizio)
  let giorniRimanenti = giorni

  while (giorniRimanenti > 0) {
    result.setDate(result.getDate() + 1)

    if (sospensioneFeriale && isInSospensioneFeriale(result)) {
      continue
    }

    if (escludiFestivi && isFestivo(result)) {
      continue
    }

    giorniRimanenti--
  }

  // Se scade in giorno festivo, proroga al primo giorno non festivo
  while (isFestivo(result)) {
    result.setDate(result.getDate() + 1)
  }

  return result
}

export function giorniTraDate(data1: Date, data2: Date): number {
  const diff = data2.getTime() - data1.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function giorniAllaScadenza(dataScadenza: string | Date): number {
  const d = typeof dataScadenza === 'string' ? new Date(dataScadenza) : dataScadenza
  return giorniTraDate(new Date(), d)
}
