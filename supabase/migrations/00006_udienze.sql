-- 00006_udienze.sql

CREATE TYPE tipo_udienza AS ENUM (
  'prima_udienza', 'udienza_istruttoria', 'udienza_precisazione_conclusioni',
  'udienza_discussione', 'udienza_gip', 'udienza_gup',
  'udienza_dibattimentale', 'udienza_camerale', 'udienza_cautelare',
  'mediazione', 'negoziazione_assistita', 'arbitrato',
  'udienza_convalida', 'udienza_riesame', 'altro'
);

CREATE TYPE esito_udienza AS ENUM (
  'rinviata', 'conclusa', 'sospesa', 'cancellata',
  'sentenza_emessa', 'ordinanza_emessa', 'conciliazione'
);

CREATE TABLE udienze (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  fascicolo_id UUID NOT NULL REFERENCES fascicoli(id) ON DELETE CASCADE,
  tipo tipo_udienza NOT NULL,
  data_udienza TIMESTAMPTZ NOT NULL,
  durata_prevista_minuti INT DEFAULT 60,
  autorita TEXT NOT NULL,
  aula TEXT,
  indirizzo TEXT,
  modalita TEXT DEFAULT 'presenza',
  link_telematica TEXT,
  avvocato_presente UUID REFERENCES profili(id),
  avvocato_sostituto UUID REFERENCES profili(id),
  esito esito_udienza,
  data_prossima_udienza DATE,
  note_udienza TEXT,
  verbale TEXT,
  provvedimento TEXT,
  preparazione_completata BOOLEAN DEFAULT false,
  checklist JSONB DEFAULT '[]'::jsonb,
  documenti_da_produrre TEXT[],
  ai_suggerimenti_pre TEXT,
  ai_note_real_time TEXT,
  ai_analisi_post TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_udienze_studio ON udienze(studio_id);
CREATE INDEX idx_udienze_data ON udienze(studio_id, data_udienza);
CREATE INDEX idx_udienze_fascicolo ON udienze(fascicolo_id);
CREATE INDEX idx_udienze_avvocato ON udienze(avvocato_presente, data_udienza);
