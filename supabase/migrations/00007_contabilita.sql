-- 00007_contabilita.sql

CREATE TYPE tipo_fattura AS ENUM (
  'fattura', 'nota_credito', 'nota_debito',
  'proforma', 'parcella', 'avviso_parcella'
);

CREATE TYPE stato_fattura AS ENUM (
  'bozza', 'emessa', 'inviata_sdi', 'consegnata',
  'accettata', 'rifiutata', 'pagata', 'parzialmente_pagata',
  'scaduta', 'annullata', 'in_contenzioso'
);

CREATE TYPE metodo_pagamento AS ENUM (
  'bonifico', 'assegno', 'carta', 'contanti',
  'ri_ba', 'mav', 'compensazione'
);

CREATE TABLE fatture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  tipo tipo_fattura NOT NULL DEFAULT 'fattura',
  stato stato_fattura NOT NULL DEFAULT 'bozza',
  numero TEXT NOT NULL,
  anno INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  data_emissione DATE NOT NULL DEFAULT CURRENT_DATE,
  data_scadenza_pagamento DATE,
  cliente_id UUID NOT NULL REFERENCES soggetti(id),
  fascicolo_id UUID REFERENCES fascicoli(id),
  imponibile DECIMAL(12,2) NOT NULL DEFAULT 0,
  cpa DECIMAL(12,2) DEFAULT 0,
  iva_aliquota DECIMAL(5,2) DEFAULT 22,
  iva_importo DECIMAL(12,2) DEFAULT 0,
  ritenuta_aliquota DECIMAL(5,2) DEFAULT 20,
  ritenuta_importo DECIMAL(12,2) DEFAULT 0,
  bollo DECIMAL(8,2) DEFAULT 0,
  spese_esenti DECIMAL(12,2) DEFAULT 0,
  spese_imponibili DECIMAL(12,2) DEFAULT 0,
  totale_documento DECIMAL(12,2) NOT NULL DEFAULT 0,
  totale_dovuto DECIMAL(12,2) NOT NULL DEFAULT 0,
  metodo_pagamento metodo_pagamento,
  iban TEXT,
  banca TEXT,
  data_pagamento DATE,
  importo_pagato DECIMAL(12,2) DEFAULT 0,
  sdi_id_trasmissione TEXT,
  sdi_stato TEXT,
  sdi_data_invio TIMESTAMPTZ,
  sdi_data_risposta TIMESTAMPTZ,
  sdi_xml TEXT,
  sdi_notifica_xml TEXT,
  codice_destinatario VARCHAR(7),
  dm55_fase TEXT,
  dm55_scaglione TEXT,
  dm55_parametri JSONB,
  note TEXT,
  condizioni_pagamento TEXT,
  emessa_da UUID REFERENCES profili(id),
  documento_id UUID REFERENCES documenti(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fattura_voci (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fattura_id UUID NOT NULL REFERENCES fatture(id) ON DELETE CASCADE,
  ordine INT NOT NULL DEFAULT 0,
  descrizione TEXT NOT NULL,
  quantita DECIMAL(10,2) DEFAULT 1,
  prezzo_unitario DECIMAL(10,2) NOT NULL,
  importo DECIMAL(12,2) NOT NULL,
  tipo TEXT DEFAULT 'compenso',
  attivita_id UUID REFERENCES fascicolo_attivita(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pagamenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  fattura_id UUID NOT NULL REFERENCES fatture(id),
  data_pagamento DATE NOT NULL,
  importo DECIMAL(12,2) NOT NULL,
  metodo metodo_pagamento NOT NULL,
  riferimento TEXT,
  note TEXT,
  registrato_da UUID REFERENCES profili(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fatture_studio ON fatture(studio_id);
CREATE INDEX idx_fatture_cliente ON fatture(cliente_id);
CREATE INDEX idx_fatture_fascicolo ON fatture(fascicolo_id);
CREATE INDEX idx_fatture_stato ON fatture(studio_id, stato);
CREATE INDEX idx_fatture_data ON fatture(studio_id, data_emissione);
