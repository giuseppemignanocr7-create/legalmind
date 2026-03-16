-- 00005_scadenziario.sql

CREATE TYPE tipo_scadenza AS ENUM (
  'termine_processuale', 'termine_perentorio', 'termine_ordinatorio',
  'prescrizione', 'decadenza', 'udienza', 'adempimento',
  'scadenza_fiscale', 'scadenza_amministrativa', 'promemoria',
  'follow_up', 'rinnovo', 'altro'
);

CREATE TYPE stato_scadenza AS ENUM (
  'attiva', 'completata', 'scaduta', 'annullata', 'prorogata'
);

CREATE TYPE urgenza_scadenza AS ENUM (
  'bassa', 'media', 'alta', 'critica'
);

CREATE TABLE scadenze (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  fascicolo_id UUID REFERENCES fascicoli(id) ON DELETE SET NULL,
  tipo tipo_scadenza NOT NULL,
  stato stato_scadenza NOT NULL DEFAULT 'attiva',
  urgenza urgenza_scadenza NOT NULL DEFAULT 'media',
  titolo TEXT NOT NULL,
  descrizione TEXT,
  data_scadenza DATE NOT NULL,
  ora_scadenza TIME,
  data_alert_1 DATE,
  data_alert_2 DATE,
  data_alert_3 DATE,
  data_completamento DATE,
  riferimento_normativo TEXT,
  termine_giorni INT,
  data_riferimento DATE,
  sospensione_feriale BOOLEAN DEFAULT false,
  giorni_festivi_esclusi BOOLEAN DEFAULT false,
  assegnato_a UUID REFERENCES profili(id),
  created_by UUID REFERENCES profili(id),
  ricorrente BOOLEAN DEFAULT false,
  ricorrenza_pattern TEXT,
  ricorrenza_fine DATE,
  ai_calcolata BOOLEAN DEFAULT false,
  ai_fonte TEXT,
  alert_email BOOLEAN DEFAULT true,
  alert_pec BOOLEAN DEFAULT false,
  alert_sms BOOLEAN DEFAULT false,
  alert_push BOOLEAN DEFAULT true,
  alert_inviati JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scadenze_studio ON scadenze(studio_id);
CREATE INDEX idx_scadenze_data ON scadenze(studio_id, data_scadenza) WHERE stato = 'attiva';
CREATE INDEX idx_scadenze_fascicolo ON scadenze(fascicolo_id);
CREATE INDEX idx_scadenze_assegnato ON scadenze(assegnato_a, data_scadenza) WHERE stato = 'attiva';
CREATE INDEX idx_scadenze_urgenza ON scadenze(studio_id, urgenza, data_scadenza) WHERE stato = 'attiva';
