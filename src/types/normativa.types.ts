import type { UUID, ISODateTime } from './common.types'

export type AreaDiritto = 'civile' | 'penale' | 'amministrativo' | 'tributario' | 'lavoro' | 'commerciale' | 'famiglia' | 'ue' | 'internazionale' | 'privacy' | 'ambientale' | 'digitale' | 'costituzionale' | 'processuale_civile' | 'processuale_penale' | 'fallimentare' | 'previdenziale'
export type SeveritaNormativa = 'informativa' | 'media' | 'alta' | 'critica'
export type FonteNormativa = 'gazzetta_ufficiale' | 'gu_ue' | 'cassazione' | 'corte_costituzionale' | 'cgue' | 'consiglio_stato' | 'tar' | 'garante_privacy' | 'agenzia_entrate' | 'inps' | 'inail' | 'consob' | 'agcom' | 'antitrust' | 'cnf' | 'parlamento' | 'governo'

export interface NormativaFeedItem {
  id: UUID
  fonte: FonteNormativa
  area: AreaDiritto
  severita: SeveritaNormativa
  titolo: string
  sintesi?: string
  contenuto?: string
  url_fonte?: string
  data_pubblicazione: string
  riferimento_normativo?: string
  iter_legislativo_stato?: string
  tags?: string[]
  ai_analisi?: string
  ai_impatto?: string
  ai_fascicoli_impattati: number
  created_at: ISODateTime
}

export interface NormativaAlert {
  id: UUID
  studio_id: UUID
  profilo_id?: UUID
  aree: AreaDiritto[]
  fonti?: FonteNormativa[]
  keywords?: string[]
  severita_minima: SeveritaNormativa
  canale: string[]
  attivo: boolean
  created_at: ISODateTime
}
