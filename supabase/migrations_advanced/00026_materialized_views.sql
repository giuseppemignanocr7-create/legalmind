-- ============================================================================
-- 00026: MATERIALIZED VIEWS PER DASHBOARD, KPI & ANALYTICS
-- Aggregazioni pre-calcolate per performance estrema su query complesse
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. KPI DASHBOARD STUDIO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_studio_kpi AS
SELECT
  s.id AS studio_id,
  -- Fascicoli
  COUNT(DISTINCT f.id) FILTER (WHERE f.stato IN ('aperto','in_corso')) AS fascicoli_attivi,
  COUNT(DISTINCT f.id) FILTER (WHERE f.stato = 'chiuso_vinto') AS fascicoli_vinti,
  COUNT(DISTINCT f.id) FILTER (WHERE f.stato = 'chiuso_perso') AS fascicoli_persi,
  COUNT(DISTINCT f.id) FILTER (WHERE f.stato IN ('chiuso_vinto','chiuso_perso','chiuso_transatto','archiviato')) AS fascicoli_chiusi,
  COUNT(DISTINCT f.id) AS fascicoli_totali,
  CASE WHEN COUNT(DISTINCT f.id) FILTER (WHERE f.stato IN ('chiuso_vinto','chiuso_perso')) > 0
    THEN ROUND(COUNT(DISTINCT f.id) FILTER (WHERE f.stato = 'chiuso_vinto')::NUMERIC / 
         NULLIF(COUNT(DISTINCT f.id) FILTER (WHERE f.stato IN ('chiuso_vinto','chiuso_perso')), 0) * 100, 1)
    ELSE 0
  END AS tasso_successo_pct,
  -- Clienti
  COUNT(DISTINCT so.id) FILTER (WHERE so.tipo_soggetto = 'cliente') AS clienti_totali,
  COUNT(DISTINCT so.id) FILTER (WHERE so.tipo_soggetto = 'cliente' AND so.created_at > NOW() - INTERVAL '30 days') AS clienti_nuovi_mese,
  -- Scadenze
  COUNT(DISTINCT sc.id) FILTER (WHERE sc.stato = 'attiva' AND sc.data_scadenza < CURRENT_DATE) AS scadenze_scadute,
  COUNT(DISTINCT sc.id) FILTER (WHERE sc.stato = 'attiva' AND sc.data_scadenza BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) AS scadenze_prossima_settimana,
  COUNT(DISTINCT sc.id) FILTER (WHERE sc.stato = 'attiva') AS scadenze_attive,
  -- Udienze
  COUNT(DISTINCT u.id) FILTER (WHERE u.data_udienza >= NOW() AND u.data_udienza < NOW() + INTERVAL '30 days') AS udienze_prossimo_mese,
  -- Timestamp
  NOW() AS ultimo_aggiornamento
FROM studi_legali s
LEFT JOIN fascicoli f ON f.studio_id = s.id
LEFT JOIN soggetti so ON so.studio_id = s.id
LEFT JOIN scadenze sc ON sc.studio_id = s.id
LEFT JOIN udienze u ON u.studio_id = s.id
GROUP BY s.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_studio_kpi ON mv_studio_kpi(studio_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. FATTURATO MENSILE PER STUDIO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_fatturato_mensile AS
SELECT
  f.studio_id,
  DATE_TRUNC('month', f.data_emissione)::DATE AS mese,
  EXTRACT(YEAR FROM f.data_emissione)::INT AS anno,
  EXTRACT(MONTH FROM f.data_emissione)::INT AS mese_num,
  COUNT(*) AS numero_fatture,
  SUM(f.totale_documento) AS fatturato_lordo,
  SUM(f.totale_dovuto) AS fatturato_netto,
  SUM(f.imponibile) AS totale_imponibile,
  SUM(f.iva_importo) AS totale_iva,
  SUM(f.cpa) AS totale_cpa,
  SUM(f.ritenuta_importo) AS totale_ritenuta,
  SUM(CASE WHEN f.stato IN ('pagata', 'parzialmente_pagata') THEN f.totale_dovuto ELSE 0 END) AS incassato,
  SUM(CASE WHEN f.stato IN ('emessa','inviata_sdi','consegnata','accettata','scaduta') THEN f.totale_dovuto ELSE 0 END) AS da_incassare,
  AVG(f.totale_dovuto) AS media_fattura
FROM fatture f
WHERE f.data_emissione IS NOT NULL
GROUP BY f.studio_id, DATE_TRUNC('month', f.data_emissione), 
         EXTRACT(YEAR FROM f.data_emissione), EXTRACT(MONTH FROM f.data_emissione);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_fatturato ON mv_fatturato_mensile(studio_id, mese);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. PRODUTTIVITA' AVVOCATO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_produttivita_avvocato AS
SELECT
  p.id AS profilo_id,
  p.studio_id,
  p.nome || ' ' || p.cognome AS avvocato,
  p.ruolo,
  DATE_TRUNC('month', fa.data)::DATE AS mese,
  -- Ore lavorate
  SUM(fa.durata_minuti) / 60.0 AS ore_lavorate,
  SUM(fa.durata_minuti) FILTER (WHERE fa.fatturabile) / 60.0 AS ore_fatturabili,
  SUM(fa.durata_minuti) FILTER (WHERE NOT fa.fatturabile) / 60.0 AS ore_non_fatturabili,
  -- Realization rate
  CASE WHEN SUM(fa.durata_minuti) > 0
    THEN ROUND(SUM(fa.durata_minuti) FILTER (WHERE fa.fatturabile)::NUMERIC / 
         NULLIF(SUM(fa.durata_minuti), 0) * 100, 1)
    ELSE 0
  END AS realization_rate,
  -- Fascicoli gestiti
  COUNT(DISTINCT fa.fascicolo_id) AS fascicoli_lavorati,
  -- Attività
  COUNT(*) AS attivita_totali,
  SUM(fa.importo) AS valore_attivita,
  SUM(fa.importo) FILTER (WHERE fa.fatturato) AS valore_fatturato,
  -- Target
  p.obiettivo_ore_mensili,
  CASE WHEN p.obiettivo_ore_mensili > 0
    THEN ROUND(SUM(fa.durata_minuti) / 60.0 / p.obiettivo_ore_mensili * 100, 1)
    ELSE 0
  END AS pct_obiettivo
FROM profili p
LEFT JOIN fascicolo_attivita fa ON fa.profilo_id = p.id
WHERE p.ruolo NOT IN ('segretaria', 'amministrativo')
GROUP BY p.id, p.studio_id, p.nome, p.cognome, p.ruolo, p.obiettivo_ore_mensili,
         DATE_TRUNC('month', fa.data);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_produttivita ON mv_produttivita_avvocato(profilo_id, mese);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. FASCICOLI PER MATERIA & STATO (per grafici analytics)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_fascicoli_distribuzione AS
SELECT
  f.studio_id,
  f.materia,
  f.stato,
  f.priorita,
  COUNT(*) AS conteggio,
  AVG(EXTRACT(EPOCH FROM (COALESCE(f.data_chiusura, NOW()) - f.data_apertura)) / 86400)::INT AS durata_media_giorni,
  MIN(f.data_apertura) AS primo_aperto,
  MAX(f.data_apertura) AS ultimo_aperto,
  SUM(f.valore_causa) AS valore_totale_cause
FROM fascicoli f
GROUP BY f.studio_id, f.materia, f.stato, f.priorita;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_fascicoli_distr ON mv_fascicoli_distribuzione(studio_id, materia, stato, priorita);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. AGING CREDITI (analisi crediti per anzianità)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_aging_crediti AS
SELECT
  f.studio_id,
  f.id AS fattura_id,
  f.numero,
  s.display_name AS cliente,
  f.totale_dovuto,
  f.data_emissione,
  f.data_scadenza_pagamento,
  CURRENT_DATE - f.data_scadenza_pagamento AS giorni_scaduto,
  CASE
    WHEN f.data_scadenza_pagamento >= CURRENT_DATE THEN 'non_scaduto'
    WHEN CURRENT_DATE - f.data_scadenza_pagamento <= 30 THEN '0-30gg'
    WHEN CURRENT_DATE - f.data_scadenza_pagamento <= 60 THEN '31-60gg'
    WHEN CURRENT_DATE - f.data_scadenza_pagamento <= 90 THEN '61-90gg'
    WHEN CURRENT_DATE - f.data_scadenza_pagamento <= 180 THEN '91-180gg'
    ELSE 'oltre_180gg'
  END AS fascia_aging,
  f.stato
FROM fatture f
LEFT JOIN soggetti s ON s.id = f.cliente_id
WHERE f.stato NOT IN ('pagata', 'annullata', 'nota_credito');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. AI USAGE ANALYTICS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ai_analytics AS
SELECT
  au.studio_id,
  DATE_TRUNC('week', au.data)::DATE AS settimana,
  SUM(au.richieste) AS richieste_totali,
  SUM(au.tokens_input + au.tokens_output) AS tokens_totali,
  SUM(au.costo_stimato) AS costo_totale,
  COUNT(DISTINCT au.profilo_id) AS utenti_attivi,
  AVG(au.tokens_input + au.tokens_output) AS tokens_media_giorno,
  MAX(au.richieste) AS picco_richieste_giorno
FROM ai_usage au
GROUP BY au.studio_id, DATE_TRUNC('week', au.data);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. REFRESH FUNCTION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_studio_kpi;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fatturato_mensile;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_produttivita_avvocato;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fascicoli_distribuzione;
  REFRESH MATERIALIZED VIEW mv_aging_crediti;
  REFRESH MATERIALIZED VIEW mv_ai_analytics;
  RAISE NOTICE 'All materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
