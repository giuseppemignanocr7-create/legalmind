import type { UUID, ISODateTime } from './common.types'
import type { TipoAtto, StatoAtto, MateriaLegale } from './database.types'

export interface Atto {
  id: UUID
  studio_id: UUID
  fascicolo_id: UUID
  tipo: TipoAtto
  stato: StatoAtto
  titolo: string
  contenuto?: string
  contenuto_raw?: string
  template_id?: UUID
  autorita_destinataria?: string
  numero_deposito?: string
  data_deposito?: string
  data_notifica?: string
  data_scadenza?: string
  versione: number
  parent_version_id?: UUID
  firmato: boolean
  firmato_da?: UUID
  firmato_at?: ISODateTime
  firma_digitale_hash?: string
  ai_generated: boolean
  ai_prompt_used?: string
  ai_validazione_normativa?: Record<string, unknown>
  ai_suggerimenti?: Record<string, unknown>
  documento_id?: UUID
  redatto_da?: UUID
  revisionato_da?: UUID
  note?: string
  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface AttoTemplate {
  id: UUID
  studio_id?: UUID
  tipo: TipoAtto
  materia?: MateriaLegale
  nome: string
  descrizione?: string
  contenuto: string
  variabili: Record<string, { label: string; tipo: string; required: boolean }>
  is_sistema: boolean
  usato_count: number
  created_at: ISODateTime
}

export interface Documento {
  id: UUID
  studio_id: UUID
  fascicolo_id?: UUID
  nome_file: string
  nome_originale: string
  tipo_mime: string
  dimensione_bytes?: number
  storage_path: string
  hash_sha256?: string
  ocr_testo?: string
  ocr_completato: boolean
  ai_sintesi?: string
  ai_classificazione?: string
  ai_entita_estratte?: Record<string, unknown>
  tags?: string[]
  caricato_da?: UUID
  created_at: ISODateTime
}
