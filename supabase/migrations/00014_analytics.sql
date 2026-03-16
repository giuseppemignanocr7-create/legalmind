-- 00014_analytics.sql

CREATE TABLE kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id) ON DELETE CASCADE,
  data_snapshot DATE NOT NULL,
  fascicoli_attivi INT,
  fascicoli_aperti_mese INT,
  fascicoli_chiusi_mese INT,
  tasso_successo DECIMAL(5,2),
  fatturato_mese DECIMAL(12,2),
  fatturato_ytd DECIMAL(12,2),
  incassato_mese DECIMAL(12,2),
  crediti_aperti DECIMAL(12,2),
  aging_0_30 DECIMAL(12,2),
  aging_31_60 DECIMAL(12,2),
  aging_61_90 DECIMAL(12,2),
  aging_90_plus DECIMAL(12,2),
  ore_fatturate_mese DECIMAL(8,2),
  ore_non_fatturate_mese DECIMAL(8,2),
  tariffa_media_oraria DECIMAL(10,2),
  scadenze_mese INT,
  scadenze_rispettate INT,
  scadenze_mancate INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(studio_id, data_snapshot)
);
