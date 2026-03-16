import type { UUID, ISODateTime } from './common.types'
import type { TipoScadenza, StatoScadenza, UrgenzaScadenza } from './database.types'

export interface Scadenza {
  id: UUID
  studio_id: UUID
  fascicolo_id?: UUID
  tipo: TipoScadenza
  stato: StatoScadenza
  urgenza: UrgenzaScadenza
  titolo: string
  descrizione?: string
  data_scadenza: string
  ora_scadenza?: string
  data_alert_1?: string
  data_alert_2?: string
  data_alert_3?: string
  data_completamento?: string
  riferimento_normativo?: string
  termine_giorni?: number
  data_riferimento?: string
  sospensione_feriale: boolean
  giorni_festivi_esclusi: boolean
  assegnato_a?: UUID
  created_by?: UUID
  ricorrente: boolean
  ricorrenza_pattern?: string
  ricorrenza_fine?: string
  ai_calcolata: boolean
  ai_fonte?: string
  alert_email: boolean
  alert_pec: boolean
  alert_sms: boolean
  alert_push: boolean
  created_at: ISODateTime
  updated_at: ISODateTime
  // Relations
  fascicolo?: { numero_interno: string; oggetto: string }
  profilo_assegnato?: { nome: string; cognome: string }
}
