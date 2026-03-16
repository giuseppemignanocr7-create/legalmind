-- 00004_atti_e_documenti.sql

CREATE TYPE tipo_atto AS ENUM (
  'atto_citazione', 'comparsa_risposta', 'memoria_183',
  'memoria_difensiva', 'memoria_replica', 'ricorso',
  'controricorso', 'appello', 'ricorso_cassazione',
  'istanza', 'precetto', 'decreto_ingiuntivo',
  'opposizione', 'querela', 'denuncia',
  'costituzione_parte_civile', 'conclusioni',
  'nota_deposito', 'contratto', 'parere',
  'diffida', 'transazione', 'procura',
  'delega', 'verbale', 'altro'
);

CREATE TYPE stato_atto AS ENUM (
  'bozza', 'in_revisione', 'approvato', 'firmato',
  'depositato', 'notificato', 'archiviato'
);

CREATE TABLE documenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  fascicolo_id UUID REFERENCES fascicoli(id) ON DELETE SET NULL,
  nome_file TEXT NOT NULL,
  nome_originale TEXT NOT NULL,
  tipo_mime TEXT NOT NULL,
  dimensione_bytes BIGINT,
  storage_path TEXT NOT NULL,
  hash_sha256 TEXT,
  ocr_testo TEXT,
  ocr_completato BOOLEAN DEFAULT false,
  ai_sintesi TEXT,
  ai_classificazione TEXT,
  ai_entita_estratte JSONB,
  tags TEXT[],
  caricato_da UUID REFERENCES profili(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE atti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  fascicolo_id UUID NOT NULL REFERENCES fascicoli(id) ON DELETE CASCADE,
  tipo tipo_atto NOT NULL,
  stato stato_atto NOT NULL DEFAULT 'bozza',
  titolo TEXT NOT NULL,
  contenuto TEXT,
  contenuto_raw TEXT,
  template_id UUID,
  autorita_destinataria TEXT,
  numero_deposito TEXT,
  data_deposito DATE,
  data_notifica DATE,
  data_scadenza DATE,
  versione INT DEFAULT 1,
  parent_version_id UUID REFERENCES atti(id),
  firmato BOOLEAN DEFAULT false,
  firmato_da UUID REFERENCES profili(id),
  firmato_at TIMESTAMPTZ,
  firma_digitale_hash TEXT,
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt_used TEXT,
  ai_validazione_normativa JSONB,
  ai_suggerimenti JSONB,
  documento_id UUID REFERENCES documenti(id),
  redatto_da UUID REFERENCES profili(id),
  revisionato_da UUID REFERENCES profili(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE atto_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studi_legali(id),
  tipo tipo_atto NOT NULL,
  materia materia_legale,
  nome TEXT NOT NULL,
  descrizione TEXT,
  contenuto TEXT NOT NULL,
  variabili JSONB NOT NULL,
  is_sistema BOOLEAN DEFAULT false,
  usato_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documenti_studio ON documenti(studio_id);
CREATE INDEX idx_documenti_fascicolo ON documenti(fascicolo_id);
CREATE INDEX idx_documenti_search ON documenti USING gin(
  to_tsvector('italian', COALESCE(nome_file,'') || ' ' || COALESCE(ocr_testo,''))
);
CREATE INDEX idx_atti_studio ON atti(studio_id);
CREATE INDEX idx_atti_fascicolo ON atti(fascicolo_id);
CREATE INDEX idx_atti_tipo ON atti(studio_id, tipo);
CREATE INDEX idx_atti_search ON atti USING gin(
  to_tsvector('italian', COALESCE(titolo,'') || ' ' || COALESCE(contenuto_raw,''))
);
