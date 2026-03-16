import type { UUID, ISODateTime } from './common.types'

export interface AIConversazione {
  id: UUID
  studio_id: UUID
  profilo_id: UUID
  fascicolo_id?: UUID
  tipo: 'chat' | 'analisi_causa' | 'redazione_atto' | 'ricerca' | 'contratto'
  titolo?: string
  created_at: ISODateTime
  updated_at: ISODateTime
  messaggi?: AIMessaggio[]
}

export interface AIMessaggio {
  id: UUID
  conversazione_id: UUID
  ruolo: 'user' | 'assistant' | 'system'
  contenuto: string
  metadata?: {
    model?: string
    tokens_in?: number
    tokens_out?: number
    latency_ms?: number
  }
  created_at: ISODateTime
}

export interface AIResponse {
  content: string
  tokensIn: number
  tokensOut: number
  model: string
  latencyMs: number
}

export interface AIUsage {
  id: UUID
  studio_id: UUID
  profilo_id: UUID
  data: string
  tokens_input: number
  tokens_output: number
  richieste: number
  costo_stimato: number
}

export interface AIAnalisi {
  id: UUID
  fascicolo_id: UUID
  tipo_analisi: 'predittiva' | 'rischio' | 'strategia' | 'normativa'
  risultato: Record<string, unknown>
  model_used?: string
  confidence?: number
  created_at: ISODateTime
  expires_at?: ISODateTime
}
