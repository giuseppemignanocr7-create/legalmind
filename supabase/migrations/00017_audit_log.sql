-- 00017_audit_log.sql

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  profilo_id UUID REFERENCES profili(id),
  azione TEXT NOT NULL,
  entita TEXT NOT NULL,
  entita_id UUID,
  dati_precedenti JSONB,
  dati_nuovi JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_studio ON audit_log(studio_id, created_at DESC);
CREATE INDEX idx_audit_entita ON audit_log(entita, entita_id);
