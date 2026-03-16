-- 00011_tributario.sql

CREATE TABLE contenzioso_tributario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fascicolo_id UUID NOT NULL REFERENCES fascicoli(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  tipo_atto_impugnato TEXT NOT NULL,
  numero_atto TEXT,
  data_notifica_atto DATE,
  ente_emittente TEXT,
  tributo TEXT,
  anno_imposta INT,
  imposta_accertata DECIMAL(12,2),
  sanzioni DECIMAL(12,2),
  interessi DECIMAL(12,2),
  totale_pretesa DECIMAL(12,2),
  data_ricorso DATE,
  commissione TEXT,
  numero_ricorso TEXT,
  istanza_sospensione BOOLEAN DEFAULT false,
  sospensione_concessa BOOLEAN,
  ai_analisi_fondatezza TEXT,
  ai_probabilita_accoglimento DECIMAL(5,2),
  ai_precedenti_rilevanti UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
