import type { UUID, ISODateTime } from './common.types'
import type { TipoFattura, StatoFattura, MetodoPagamento } from './database.types'

export interface Fattura {
  id: UUID
  studio_id: UUID
  tipo: TipoFattura
  stato: StatoFattura
  numero: string
  anno: number
  data_emissione: string
  data_scadenza_pagamento?: string
  cliente_id: UUID
  fascicolo_id?: UUID
  imponibile: number
  cpa: number
  iva_aliquota: number
  iva_importo: number
  ritenuta_aliquota: number
  ritenuta_importo: number
  bollo: number
  spese_esenti: number
  spese_imponibili: number
  totale_documento: number
  totale_dovuto: number
  metodo_pagamento?: MetodoPagamento
  iban?: string
  banca?: string
  data_pagamento?: string
  importo_pagato: number
  sdi_id_trasmissione?: string
  sdi_stato?: string
  note?: string
  condizioni_pagamento?: string
  emessa_da?: UUID
  documento_id?: UUID
  created_at: ISODateTime
  updated_at: ISODateTime
  // Relations
  cliente?: { display_name: string; codice_fiscale?: string; partita_iva?: string }
  fascicolo?: { numero_interno: string; oggetto: string }
  voci?: FatturaVoce[]
}

export interface FatturaVoce {
  id: UUID
  fattura_id: UUID
  ordine: number
  descrizione: string
  quantita: number
  prezzo_unitario: number
  importo: number
  tipo: 'compenso' | 'spesa_esente' | 'spesa_imponibile'
  attivita_id?: UUID
  created_at: ISODateTime
}

export interface Pagamento {
  id: UUID
  studio_id: UUID
  fattura_id: UUID
  data_pagamento: string
  importo: number
  metodo: MetodoPagamento
  riferimento?: string
  note?: string
  registrato_da?: UUID
  created_at: ISODateTime
}
