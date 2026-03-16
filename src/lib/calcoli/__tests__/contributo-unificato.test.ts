import { describe, it, expect } from 'vitest'
import { calcolaContributoUnificato } from '../contributo-unificato'

describe('calcolaContributoUnificato', () => {
  it('returns 43€ for value up to 1100€', () => {
    expect(calcolaContributoUnificato(1000).importo).toBe(43)
  })

  it('returns 98€ for value between 1100-5200', () => {
    expect(calcolaContributoUnificato(3000).importo).toBe(98)
  })

  it('returns 237€ for value between 5200-26000', () => {
    expect(calcolaContributoUnificato(20000).importo).toBe(237)
  })

  it('returns 518€ for value between 26000-52000', () => {
    expect(calcolaContributoUnificato(40000).importo).toBe(518)
  })

  it('returns 759€ for value between 52000-260000', () => {
    expect(calcolaContributoUnificato(100000).importo).toBe(759)
  })

  it('returns 1214€ for value between 260000-520000', () => {
    expect(calcolaContributoUnificato(300000).importo).toBe(1214)
  })

  it('returns 1686€ for value over 520000', () => {
    expect(calcolaContributoUnificato(1000000).importo).toBe(1686)
  })

  it('handles lavoro cases (exempt)', () => {
    const result = calcolaContributoUnificato(50000, 'lavoro')
    expect(result.importo).toBe(0)
  })

  it('includes marca da bollo', () => {
    const result = calcolaContributoUnificato(1000)
    expect(result.marcaDaBollo).toBe(27)
    expect(result.totale).toBe(result.importo + result.marcaDaBollo)
  })

  it('applies 50% increase for appello', () => {
    const base = calcolaContributoUnificato(100000).importo
    const appello = calcolaContributoUnificato(100000, 'appello').importo
    expect(appello).toBe(Math.round(base * 1.5))
  })
})
