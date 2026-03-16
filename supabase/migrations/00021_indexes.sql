-- 00021_indexes.sql
-- Additional composite and performance indexes

-- Fascicoli: composite for dashboard queries
CREATE INDEX IF NOT EXISTS idx_fascicoli_dashboard ON fascicoli(studio_id, stato, data_apertura DESC);
CREATE INDEX IF NOT EXISTS idx_fascicoli_priorita ON fascicoli(studio_id, priorita DESC) WHERE stato IN ('aperto', 'in_corso');

-- Scadenze: dashboard upcoming
CREATE INDEX IF NOT EXISTS idx_scadenze_upcoming ON scadenze(studio_id, data_scadenza ASC)
  WHERE stato = 'attiva' AND data_scadenza >= CURRENT_DATE;

-- Udienze: upcoming
CREATE INDEX IF NOT EXISTS idx_udienze_upcoming ON udienze(studio_id, data_udienza ASC)
  WHERE data_udienza >= NOW();

-- Fatture: unpaid
CREATE INDEX IF NOT EXISTS idx_fatture_unpaid ON fatture(studio_id, data_scadenza_pagamento)
  WHERE stato IN ('emessa', 'inviata_sdi', 'consegnata', 'accettata', 'parzialmente_pagata', 'scaduta');

-- Attivita: billable unfactured
CREATE INDEX IF NOT EXISTS idx_attivita_billable ON fascicolo_attivita(fascicolo_id)
  WHERE fatturabile = true AND fatturato = false;

-- AI conversations: recent
CREATE INDEX IF NOT EXISTS idx_ai_conv_recent ON ai_conversazioni(profilo_id, created_at DESC);

-- Audit: recent per studio
CREATE INDEX IF NOT EXISTS idx_audit_recent ON audit_log(studio_id, created_at DESC);
