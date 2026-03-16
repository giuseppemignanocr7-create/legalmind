-- 00008_normativa.sql

CREATE TYPE area_diritto AS ENUM (
  'civile', 'penale', 'amministrativo', 'tributario', 'lavoro',
  'commerciale', 'famiglia', 'ue', 'internazionale', 'privacy',
  'ambientale', 'digitale', 'costituzionale', 'processuale_civile',
  'processuale_penale', 'fallimentare', 'previdenziale'
);

CREATE TYPE severita_normativa AS ENUM ('informativa', 'media', 'alta', 'critica');

CREATE TYPE fonte_normativa AS ENUM (
  'gazzetta_ufficiale', 'gu_ue', 'cassazione', 'corte_costituzionale',
  'cgue', 'consiglio_stato', 'tar', 'garante_privacy',
  'agenzia_entrate', 'inps', 'inail', 'consob', 'agcom',
  'antitrust', 'cnf', 'parlamento', 'governo'
);

CREATE TABLE normativa_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fonte fonte_normativa NOT NULL,
  area area_diritto NOT NULL,
  severita severita_normativa NOT NULL DEFAULT 'informativa',
  titolo TEXT NOT NULL,
  sintesi TEXT,
  contenuto TEXT,
  url_fonte TEXT,
  data_pubblicazione DATE NOT NULL,
  riferimento_normativo TEXT,
  iter_legislativo_stato TEXT,
  tags TEXT[],
  ai_analisi TEXT,
  ai_impatto TEXT,
  ai_fascicoli_impattati INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE normativa_alert (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  profilo_id UUID REFERENCES profili(id),
  aree area_diritto[] NOT NULL,
  fonti fonte_normativa[],
  keywords TEXT[],
  severita_minima severita_normativa DEFAULT 'media',
  canale TEXT[] DEFAULT ARRAY['push', 'email'],
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE normativa_user_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normativa_id UUID NOT NULL REFERENCES normativa_feed(id) ON DELETE CASCADE,
  profilo_id UUID NOT NULL REFERENCES profili(id) ON DELETE CASCADE,
  letto BOOLEAN DEFAULT false,
  archiviato BOOLEAN DEFAULT false,
  nota_personale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(normativa_id, profilo_id)
);

CREATE INDEX idx_normativa_feed_data ON normativa_feed(data_pubblicazione DESC);
CREATE INDEX idx_normativa_feed_area ON normativa_feed(area, data_pubblicazione DESC);
CREATE INDEX idx_normativa_feed_fonte ON normativa_feed(fonte, data_pubblicazione DESC);
CREATE INDEX idx_normativa_feed_search ON normativa_feed USING gin(
  to_tsvector('italian', COALESCE(titolo,'') || ' ' || COALESCE(sintesi,'') || ' ' ||
  COALESCE(contenuto,''))
);
