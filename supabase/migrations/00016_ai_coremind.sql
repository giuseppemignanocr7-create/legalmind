-- 00016_ai_coremind.sql

CREATE TABLE ai_conversazioni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  profilo_id UUID NOT NULL REFERENCES profili(id),
  fascicolo_id UUID REFERENCES fascicoli(id),
  tipo TEXT NOT NULL,
  titolo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messaggi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversazione_id UUID NOT NULL REFERENCES ai_conversazioni(id) ON DELETE CASCADE,
  ruolo TEXT NOT NULL CHECK (ruolo IN ('user', 'assistant', 'system')),
  contenuto TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_analisi_fascicolo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fascicolo_id UUID NOT NULL REFERENCES fascicoli(id) ON DELETE CASCADE,
  tipo_analisi TEXT NOT NULL,
  risultato JSONB NOT NULL,
  model_used TEXT,
  confidence DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  profilo_id UUID NOT NULL REFERENCES profili(id),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_input INT DEFAULT 0,
  tokens_output INT DEFAULT 0,
  richieste INT DEFAULT 0,
  costo_stimato DECIMAL(8,4) DEFAULT 0,
  UNIQUE(studio_id, profilo_id, data)
);

CREATE INDEX idx_ai_conv_studio ON ai_conversazioni(studio_id, profilo_id);
CREATE INDEX idx_ai_conv_fascicolo ON ai_conversazioni(fascicolo_id);
CREATE INDEX idx_ai_msg_conv ON ai_messaggi(conversazione_id, created_at);
CREATE INDEX idx_ai_analisi ON ai_analisi_fascicolo(fascicolo_id, tipo_analisi);
