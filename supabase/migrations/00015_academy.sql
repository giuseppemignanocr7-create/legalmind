-- 00015_academy.sql

CREATE TABLE corsi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titolo TEXT NOT NULL,
  descrizione TEXT,
  materia area_diritto,
  docente TEXT,
  crediti_formativi INT DEFAULT 0,
  tipo TEXT DEFAULT 'on_demand',
  durata_ore DECIMAL(4,1),
  url_contenuto TEXT,
  data_webinar TIMESTAMPTZ,
  max_partecipanti INT,
  prezzo DECIMAL(8,2) DEFAULT 0,
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE iscrizioni_corsi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corso_id UUID NOT NULL REFERENCES corsi(id),
  profilo_id UUID NOT NULL REFERENCES profili(id),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  completato BOOLEAN DEFAULT false,
  progresso_percentuale INT DEFAULT 0,
  crediti_ottenuti INT DEFAULT 0,
  data_completamento DATE,
  certificato_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(corso_id, profilo_id)
);
