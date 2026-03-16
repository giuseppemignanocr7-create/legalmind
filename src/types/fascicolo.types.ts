import type { UUID, ISODateTime } from './common.types'
import type { MateriaLegale, StatoFascicolo, FaseProcessuale, RuoloProcessuale } from './database.types'
import type { Soggetto } from './cliente.types'

export interface Fascicolo {
  id: UUID
  studio_id: UUID
  numero_interno: string
  numero_rg?: string
  numero_rgn?: string
  anno: number
  materia: MateriaLegale
  sotto_materia?: string
  oggetto: string
  descrizione?: string
  valore_causa?: number
  valuta: string
  stato: StatoFascicolo
  fase?: FaseProcessuale
  priorita: number
  autorita_giudiziaria?: string
  sezione?: string
  giudice?: string
  pm?: string
  avvocato_responsabile?: UUID
  avvocato_domiciliatario?: UUID
  team_ids?: UUID[]
  data_apertura: string
  data_mandato?: string
  data_chiusura?: string
  data_prescrizione?: string
  ai_probabilita_successo?: number
  ai_analisi_rischio?: Record<string, unknown>
  ai_strategia_suggerita?: string
  ai_last_analysis?: ISODateTime
  tags?: string[]
  note_interne?: string
  is_riservato: boolean
  created_at: ISODateTime
  updated_at: ISODateTime
  // Relations
  fascicolo_parti?: FascicoloParte[]
  atti?: { id: UUID; tipo: string; titolo: string; stato: string; data_deposito?: string }[]
  udienze?: { id: UUID; tipo: string; data_udienza: string; esito?: string }[]
  scadenze?: { id: UUID; tipo: string; titolo: string; data_scadenza: string; stato: string }[]
}

export interface FascicoloParte {
  id: UUID
  fascicolo_id: UUID
  soggetto_id: UUID
  ruolo: RuoloProcessuale
  avvocato_controparte?: string
  pec_avvocato_controparte?: string
  note?: string
  soggetti?: Soggetto
  created_at: ISODateTime
}

export interface FascicoloEvento {
  id: UUID
  fascicolo_id: UUID
  tipo: string
  titolo: string
  descrizione?: string
  data_evento: ISODateTime
  eseguito_da?: UUID
  documenti_ids?: UUID[]
  metadata?: Record<string, unknown>
  created_at: ISODateTime
}

export interface FascicoloAttivita {
  id: UUID
  fascicolo_id: UUID
  profilo_id: UUID
  tipo: string
  descrizione: string
  data_attivita: string
  ore_lavorate?: number
  minuti_lavorate?: number
  tariffa_applicata?: number
  importo?: number
  fatturabile: boolean
  fatturato: boolean
  fattura_id?: UUID
  note?: string
  created_at: ISODateTime
}
