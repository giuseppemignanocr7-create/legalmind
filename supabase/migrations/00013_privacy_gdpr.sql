-- 00013_privacy_gdpr.sql

CREATE TABLE registro_trattamenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  nome_trattamento TEXT NOT NULL,
  finalita TEXT NOT NULL,
  base_giuridica TEXT NOT NULL,
  categorie_interessati TEXT[],
  categorie_dati TEXT[],
  destinatari TEXT[],
  trasferimento_extra_ue BOOLEAN DEFAULT false,
  paesi_destinazione TEXT[],
  termine_cancellazione TEXT,
  misure_sicurezza TEXT[],
  responsabile_trattamento TEXT,
  dpo TEXT,
  dpia_necessaria BOOLEAN DEFAULT false,
  dpia_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_breach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  data_rilevazione TIMESTAMPTZ NOT NULL,
  data_violazione TIMESTAMPTZ,
  descrizione TEXT NOT NULL,
  natura_violazione TEXT[],
  categorie_dati_coinvolti TEXT[],
  numero_interessati INT,
  conseguenze_probabili TEXT,
  misure_adottate TEXT,
  notifica_garante BOOLEAN DEFAULT false,
  data_notifica_garante TIMESTAMPTZ,
  comunicazione_interessati BOOLEAN DEFAULT false,
  data_comunicazione TIMESTAMPTZ,
  stato TEXT DEFAULT 'aperto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
