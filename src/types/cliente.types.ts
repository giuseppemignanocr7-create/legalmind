import type { UUID, ISODateTime } from './common.types'
import type { TipoSoggetto, StatoCliente } from './database.types'

export interface Soggetto {
  id: UUID
  studio_id: UUID
  tipo: TipoSoggetto
  stato: StatoCliente
  nome?: string
  cognome?: string
  codice_fiscale?: string
  data_nascita?: string
  luogo_nascita?: string
  sesso?: string
  ragione_sociale?: string
  partita_iva?: string
  forma_giuridica?: string
  legale_rappresentante?: string
  cf_legale_rappresentante?: string
  indirizzo?: string
  cap?: string
  citta?: string
  provincia?: string
  nazione: string
  telefono?: string
  cellulare?: string
  email?: string
  pec?: string
  fonte_acquisizione?: string
  referente?: string
  note?: string
  rating?: number
  tags?: string[]
  kyc_verificato: boolean
  kyc_data_verifica?: ISODateTime
  aml_risk_level?: 'basso' | 'medio' | 'alto'
  pep: boolean
  display_name: string
  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface ConflictCheckResult {
  soggetto_id: UUID
  display_name: string
  fascicoli_coinvolti: {
    fascicolo_id: UUID
    ruolo: string
    numero: string
  }[]
  tipo_conflitto: 'CONFLITTO DIRETTO' | 'POTENZIALE CONFLITTO' | 'COLLEGAMENTO'
}
