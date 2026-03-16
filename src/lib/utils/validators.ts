import { z } from 'zod'

export const codiceFiscaleRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i
export const partitaIvaRegex = /^\d{11}$/
export const pecRegex = /^[\w.+-]+@[\w.-]+\.[\w]{2,}$/
export const capRegex = /^\d{5}$/

export function validateCodiceFiscale(cf: string): boolean {
  if (!codiceFiscaleRegex.test(cf)) return false
  const even: Record<string, number> = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19, 'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25 }
  const odd: Record<string, number> = { '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21, 'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21, 'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14, 'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23 }
  const upper = cf.toUpperCase()
  let sum = 0
  for (let i = 0; i < 15; i++) {
    sum += i % 2 === 0 ? odd[upper[i]] : even[upper[i]]
  }
  const expected = String.fromCharCode(65 + (sum % 26))
  return upper[15] === expected
}

export function validatePartitaIva(piva: string): boolean {
  if (!partitaIvaRegex.test(piva)) return false
  let sum = 0
  for (let i = 0; i < 11; i++) {
    let n = parseInt(piva[i])
    if (i % 2 === 1) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
  }
  return sum % 10 === 0
}

export const soggettoSchema = z.object({
  tipo: z.enum(['persona_fisica', 'persona_giuridica', 'ente_pubblico', 'associazione']),
  nome: z.string().min(1).optional(),
  cognome: z.string().min(1).optional(),
  ragione_sociale: z.string().min(1).optional(),
  codice_fiscale: z.string().regex(codiceFiscaleRegex, 'Codice fiscale non valido').optional(),
  partita_iva: z.string().regex(partitaIvaRegex, 'Partita IVA non valida').optional(),
  email: z.string().email('Email non valida').optional(),
  pec: z.string().email('PEC non valida').optional(),
  cap: z.string().regex(capRegex, 'CAP non valido').optional(),
})

export const fascicoloSchema = z.object({
  materia: z.string().min(1, 'Materia obbligatoria'),
  oggetto: z.string().min(3, 'Oggetto obbligatorio (min 3 caratteri)'),
  descrizione: z.string().optional(),
  valore_causa: z.number().positive().optional(),
  autorita_giudiziaria: z.string().optional(),
  numero_rg: z.string().optional(),
})

export const fatturaSchema = z.object({
  cliente_id: z.string().uuid('Cliente obbligatorio'),
  data_emissione: z.string().min(1, 'Data emissione obbligatoria'),
  data_scadenza_pagamento: z.string().optional(),
  note: z.string().optional(),
})
