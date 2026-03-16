-- 00003_fascicoli.sql

CREATE TYPE materia_legale AS ENUM (
  'civile', 'penale', 'amministrativo', 'tributario', 'lavoro',
  'famiglia', 'societario', 'fallimentare', 'esecuzioni',
  'stragiudiziale', 'recupero_crediti', 'immobiliare',
  'proprieta_intellettuale', 'privacy', 'ambientale',
  'internazionale', 'comunitario', 'altro'
);

CREATE TYPE stato_fascicolo AS ENUM (
  'aperto', 'in_corso', 'sospeso', 'in_attesa',
  'chiuso_favorevole', 'chiuso_sfavorevole', 'chiuso_transazione',
  'archiviato', 'annullato'
);

CREATE TYPE fase_processuale AS ENUM (
  'precontenzioso', 'mediazione', 'negoziazione_assistita',
  'primo_grado', 'appello', 'cassazione', 'esecuzione',
  'giudice_pace', 'arbitrato', 'stragiudiziale'
);

CREATE TYPE ruolo_processuale AS ENUM (
  'attore', 'convenuto', 'ricorrente', 'resistente',
  'appellante', 'appellato', 'imputato', 'parte_civile',
  'persona_offesa', 'indagato', 'terzo_chiamato',
  'interveniente', 'opponente', 'opposto'
);

CREATE TABLE fascicoli (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  numero_interno TEXT NOT NULL,
  numero_rg TEXT,
  numero_rgn TEXT,
  anno INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  materia materia_legale NOT NULL,
  sotto_materia TEXT,
  oggetto TEXT NOT NULL,
  descrizione TEXT,
  valore_causa DECIMAL(15,2),
  valuta VARCHAR(3) DEFAULT 'EUR',
  stato stato_fascicolo NOT NULL DEFAULT 'aperto',
  fase fase_processuale,
  priorita INT DEFAULT 3 CHECK (priorita BETWEEN 1 AND 5),
  autorita_giudiziaria TEXT,
  sezione TEXT,
  giudice TEXT,
  pm TEXT,
  avvocato_responsabile UUID REFERENCES profili(id),
  avvocato_domiciliatario UUID REFERENCES profili(id),
  team_ids UUID[],
  data_apertura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_mandato DATE,
  data_chiusura DATE,
  data_prescrizione DATE,
  ai_probabilita_successo DECIMAL(5,2),
  ai_analisi_rischio JSONB,
  ai_strategia_suggerita TEXT,
  ai_last_analysis TIMESTAMPTZ,
  tags TEXT[],
  note_interne TEXT,
  is_riservato BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fascicolo_parti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fascicolo_id UUID NOT NULL REFERENCES fascicoli(id) ON DELETE CASCADE,
  soggetto_id UUID NOT NULL REFERENCES soggetti(id),
  ruolo ruolo_processuale NOT NULL,
  avvocato_controparte TEXT,
  pec_avvocato_controparte TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fascicolo_eventi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fascicolo_id UUID NOT NULL REFERENCES fascicoli(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titolo TEXT NOT NULL,
  descrizione TEXT,
  data_evento TIMESTAMPTZ NOT NULL,
  eseguito_da UUID REFERENCES profili(id),
  documenti_ids UUID[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fascicolo_attivita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fascicolo_id UUID NOT NULL REFERENCES fascicoli(id) ON DELETE CASCADE,
  profilo_id UUID NOT NULL REFERENCES profili(id),
  tipo TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  data_attivita DATE NOT NULL DEFAULT CURRENT_DATE,
  ore_lavorate DECIMAL(5,2),
  minuti_lavorate INT,
  tariffa_applicata DECIMAL(10,2),
  importo DECIMAL(10,2),
  fatturabile BOOLEAN DEFAULT true,
  fatturato BOOLEAN DEFAULT false,
  fattura_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fascicoli_studio ON fascicoli(studio_id);
CREATE INDEX idx_fascicoli_stato ON fascicoli(studio_id, stato);
CREATE INDEX idx_fascicoli_materia ON fascicoli(studio_id, materia);
CREATE INDEX idx_fascicoli_avvocato ON fascicoli(avvocato_responsabile);
CREATE INDEX idx_fascicoli_rg ON fascicoli(numero_rg);
CREATE INDEX idx_fascicoli_search ON fascicoli USING gin(
  to_tsvector('italian', COALESCE(oggetto,'') || ' ' || COALESCE(descrizione,'') || ' ' ||
  COALESCE(numero_rg,'') || ' ' || COALESCE(numero_interno,''))
);
CREATE INDEX idx_fascicolo_eventi_fascicolo ON fascicolo_eventi(fascicolo_id, data_evento DESC);
CREATE INDEX idx_fascicolo_attivita_fascicolo ON fascicolo_attivita(fascicolo_id);
CREATE INDEX idx_fascicolo_attivita_profilo ON fascicolo_attivita(profilo_id, data_attivita);
