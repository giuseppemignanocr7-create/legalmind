-- 00012_lavoro.sql

CREATE TABLE vertenze_lavoro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fascicolo_id UUID NOT NULL REFERENCES fascicoli(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  tipo_rapporto TEXT NOT NULL,
  ccnl TEXT,
  livello TEXT,
  mansione TEXT,
  data_assunzione DATE,
  data_cessazione DATE,
  motivo_cessazione TEXT,
  retribuzione_base DECIMAL(10,2),
  retribuzione_lorda_mensile DECIMAL(10,2),
  mensilita INT DEFAULT 13,
  differenze_retributive DECIMAL(12,2),
  tfr_maturato DECIMAL(12,2),
  tfr_versato DECIMAL(12,2),
  indennita_mancato_preavviso DECIMAL(12,2),
  danni_richiesti DECIMAL(12,2),
  totale_pretese DECIMAL(12,2),
  tentativo_conciliazione BOOLEAN DEFAULT false,
  data_conciliazione DATE,
  esito_conciliazione TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
