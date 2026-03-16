-- 00009_giurisprudenza.sql

CREATE TYPE tipo_provvedimento AS ENUM (
  'sentenza', 'ordinanza', 'decreto', 'massima'
);

CREATE TYPE organo_giudicante AS ENUM (
  'cassazione_ssuu', 'cassazione_sezione', 'corte_costituzionale',
  'cgue', 'cedu', 'corte_appello', 'tribunale', 'giudice_pace',
  'tar', 'consiglio_stato', 'corte_conti',
  'commissione_tributaria_provinciale', 'commissione_tributaria_regionale'
);

CREATE TABLE sentenze (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organo organo_giudicante NOT NULL,
  sezione TEXT,
  numero TEXT NOT NULL,
  anno INT NOT NULL,
  data_decisione DATE,
  data_pubblicazione DATE,
  massima TEXT,
  testo_integrale TEXT,
  dispositivo TEXT,
  principi_diritto TEXT[],
  materia materia_legale NOT NULL,
  sotto_materia TEXT,
  argomenti TEXT[],
  norme_riferimento TEXT[],
  ecli TEXT,
  url_fonte TEXT,
  sentenze_citate UUID[],
  sentenze_conformi UUID[],
  sentenze_difformi UUID[],
  ai_sintesi TEXT,
  ai_keywords TEXT[],
  ai_rilevanza_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sentenze_salvate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  sentenza_id UUID NOT NULL REFERENCES sentenze(id),
  fascicolo_id UUID REFERENCES fascicoli(id),
  nota TEXT,
  salvata_da UUID REFERENCES profili(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentenze_organo ON sentenze(organo, anno DESC);
CREATE INDEX idx_sentenze_materia ON sentenze(materia, data_pubblicazione DESC);
CREATE INDEX idx_sentenze_ecli ON sentenze(ecli);
CREATE INDEX idx_sentenze_search ON sentenze USING gin(
  to_tsvector('italian', COALESCE(massima,'') || ' ' || COALESCE(testo_integrale,''))
);
