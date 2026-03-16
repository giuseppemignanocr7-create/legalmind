import type { UUID, ISODateTime } from './common.types'
import type { TipoUdienza, EsitoUdienza } from './database.types'

export interface Udienza {
  id: UUID
  studio_id: UUID
  fascicolo_id: UUID
  tipo: TipoUdienza
  data_udienza: ISODateTime
  durata_prevista_minuti: number
  autorita: string
  aula?: string
  indirizzo?: string
  modalita: 'presenza' | 'telematica' | 'mista'
  link_telematica?: string
  avvocato_presente?: UUID
  avvocato_sostituto?: UUID
  esito?: EsitoUdienza
  data_prossima_udienza?: string
  note_udienza?: string
  verbale?: string
  provvedimento?: string
  preparazione_completata: boolean
  checklist: { label: string; done: boolean }[]
  documenti_da_produrre?: string[]
  ai_suggerimenti_pre?: string
  ai_note_real_time?: string
  ai_analisi_post?: string
  created_at: ISODateTime
  updated_at: ISODateTime
  fascicolo?: { numero_interno: string; oggetto: string; materia: string }
}
