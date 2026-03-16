-- 00002_clienti_e_controparti.sql

CREATE TYPE tipo_soggetto AS ENUM (
  'persona_fisica', 'persona_giuridica', 'ente_pubblico', 'associazione'
);

CREATE TYPE stato_cliente AS ENUM (
  'attivo', 'inattivo', 'potenziale', 'ex_cliente', 'controparte'
);

CREATE TYPE tipo_relazione AS ENUM (
  'cliente', 'controparte', 'terzo_interessato', 'testimone',
  'perito', 'consulente', 'curatore', 'tutore', 'amministratore_sostegno'
);

CREATE TABLE soggetti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  tipo tipo_soggetto NOT NULL,
  stato stato_cliente NOT NULL DEFAULT 'attivo',
  nome TEXT,
  cognome TEXT,
  codice_fiscale VARCHAR(16),
  data_nascita DATE,
  luogo_nascita TEXT,
  sesso CHAR(1),
  ragione_sociale TEXT,
  partita_iva VARCHAR(11),
  forma_giuridica TEXT,
  legale_rappresentante TEXT,
  cf_legale_rappresentante VARCHAR(16),
  indirizzo TEXT,
  cap VARCHAR(5),
  citta TEXT,
  provincia VARCHAR(2),
  nazione TEXT DEFAULT 'IT',
  telefono TEXT,
  cellulare TEXT,
  email TEXT,
  pec TEXT,
  fonte_acquisizione TEXT,
  referente TEXT,
  note TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  tags TEXT[],
  kyc_verificato BOOLEAN DEFAULT false,
  kyc_data_verifica TIMESTAMPTZ,
  kyc_documento_tipo TEXT,
  kyc_documento_numero TEXT,
  kyc_documento_scadenza DATE,
  aml_risk_level TEXT CHECK (aml_risk_level IN ('basso', 'medio', 'alto')),
  aml_last_check TIMESTAMPTZ,
  pep BOOLEAN DEFAULT false,
  display_name TEXT GENERATED ALWAYS AS (
    COALESCE(ragione_sociale, CONCAT(cognome, ' ', nome))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conflict_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  soggetto_id UUID REFERENCES soggetti(id),
  query_text TEXT NOT NULL,
  risultato JSONB NOT NULL,
  eseguito_da UUID REFERENCES profili(id),
  eseguito_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_soggetti_studio ON soggetti(studio_id);
CREATE INDEX idx_soggetti_cf ON soggetti(codice_fiscale);
CREATE INDEX idx_soggetti_piva ON soggetti(partita_iva);
CREATE INDEX idx_soggetti_display ON soggetti(studio_id, display_name);
CREATE INDEX idx_soggetti_search ON soggetti USING gin(
  to_tsvector('italian', COALESCE(nome,'') || ' ' || COALESCE(cognome,'') || ' ' ||
  COALESCE(ragione_sociale,'') || ' ' || COALESCE(codice_fiscale,''))
);
