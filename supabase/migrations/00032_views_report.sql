-- ============================================================================
-- 00032: VIEWS SQL PER REPORT, ANALYTICS & BUSINESS INTELLIGENCE
-- Query pre-ottimizzate per frontend, export PDF, dashboard
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. VISTA FASCICOLI COMPLETA (con contatori denormalizzati)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE VIEW v_fascicoli_completi AS
SELECT
  f.*,
  p_resp.nome || ' ' || p_resp.cognome AS avvocato_responsabile_nome,
  p_dom.nome || ' ' || p_dom.cognome AS dominus_nome,
  -- Contatori
  (SELECT COUNT(*) FROM atti WHERE fascicolo_id = f.id) AS num_atti,
  (SELECT COUNT(*) FROM documenti WHERE fascicolo_id = f.id) AS num_documenti,
  (SELECT COUNT(*) FROM scadenze WHERE fascicolo_id = f.id AND stato = 'attiva') AS num_scadenze_attive,
  (SELECT COUNT(*) FROM udienze WHERE fascicolo_id = f.id AND data_udienza > NOW()) AS num_udienze_future,
  (SELECT COUNT(*) FROM fascicolo_parti WHERE fascicolo_id = f.id) AS num_parti,
  -- Economico
  (SELECT COALESCE(SUM(totale_dovuto), 0) FROM fatture WHERE fascicolo_id = f.id) AS fatturato_totale,
  (SELECT COALESCE(SUM(totale_dovuto), 0) FROM fatture WHERE fascicolo_id = f.id AND stato = 'pagata') AS incassato_totale,
  (SELECT COALESCE(SUM(durata_minuti), 0) FROM fascicolo_attivita WHERE fascicolo_id = f.id) AS minuti_lavorati,
  -- Prossima scadenza
  (SELECT MIN(data_scadenza) FROM scadenze WHERE fascicolo_id = f.id AND stato = 'attiva') AS prossima_scadenza,
  -- Prossima udienza
  (SELECT MIN(data_udienza) FROM udienze WHERE fascicolo_id = f.id AND data_udienza > NOW()) AS prossima_udienza,
  -- Durata
  EXTRACT(DAY FROM (COALESCE(f.data_chiusura, NOW()) - f.data_apertura))::INT AS durata_giorni,
  -- Parti (JSON per frontend)
  (SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'soggetto_id', fp.soggetto_id, 'ruolo', fp.ruolo,
    'nome', s.display_name, 'tipo', s.tipo_soggetto
  )), '[]'::JSONB) FROM fascicolo_parti fp JOIN soggetti s ON s.id = fp.soggetto_id WHERE fp.fascicolo_id = f.id) AS parti_json
FROM fascicoli f
LEFT JOIN profili p_resp ON p_resp.id = f.avvocato_responsabile
LEFT JOIN profili p_dom ON p_dom.id = f.dominus;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. VISTA CLIENTI CON ANALYTICS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE VIEW v_clienti_analytics AS
SELECT
  s.*,
  -- Fascicoli
  COUNT(DISTINCT fp.fascicolo_id) AS fascicoli_totali,
  COUNT(DISTINCT fp.fascicolo_id) FILTER (WHERE f.stato IN ('aperto','in_corso')) AS fascicoli_attivi,
  COUNT(DISTINCT fp.fascicolo_id) FILTER (WHERE f.stato = 'chiuso_vinto') AS fascicoli_vinti,
  -- Fatturazione
  COALESCE(SUM(fat.totale_dovuto), 0) AS fatturato_totale,
  COALESCE(SUM(fat.totale_dovuto) FILTER (WHERE fat.stato = 'pagata'), 0) AS incassato_totale,
  COALESCE(SUM(fat.totale_dovuto) FILTER (WHERE fat.stato IN ('emessa','scaduta','consegnata')), 0) AS crediti_aperti,
  COUNT(fat.id) FILTER (WHERE fat.stato = 'scaduta') AS fatture_scadute,
  -- Ultimo contatto
  GREATEST(
    MAX(fp_ev.created_at),
    MAX(fat.data_emissione::TIMESTAMPTZ),
    s.ultimo_contatto
  ) AS ultimo_contatto_effettivo,
  -- Lifetime value
  COALESCE(SUM(fat.totale_dovuto) FILTER (WHERE fat.stato = 'pagata'), 0) AS lifetime_value,
  -- Materie
  ARRAY_AGG(DISTINCT f.materia) FILTER (WHERE f.materia IS NOT NULL) AS materie
FROM soggetti s
LEFT JOIN fascicolo_parti fp ON fp.soggetto_id = s.id AND fp.ruolo = 'cliente'
LEFT JOIN fascicoli f ON f.id = fp.fascicolo_id
LEFT JOIN fatture fat ON fat.cliente_id = s.id
LEFT JOIN fascicolo_attivita fp_ev ON fp_ev.fascicolo_id = fp.fascicolo_id
WHERE s.tipo_soggetto = 'cliente'
GROUP BY s.id;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. VISTA SCADENZE ARRICCHITA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE VIEW v_scadenze_arricchite AS
SELECT
  sc.*,
  f.oggetto AS fascicolo_oggetto,
  f.numero_interno AS fascicolo_numero,
  f.materia AS fascicolo_materia,
  p.nome || ' ' || p.cognome AS assegnato_nome,
  p.avatar_url AS assegnato_avatar,
  -- Stato calcolato
  CASE
    WHEN sc.stato = 'completata' THEN 'completata'
    WHEN sc.data_scadenza < CURRENT_DATE THEN 'scaduta'
    WHEN sc.data_scadenza = CURRENT_DATE THEN 'oggi'
    WHEN sc.data_scadenza <= CURRENT_DATE + 3 THEN 'imminente'
    WHEN sc.data_scadenza <= CURRENT_DATE + 7 THEN 'prossima'
    ELSE 'futura'
  END AS stato_temporale,
  sc.data_scadenza - CURRENT_DATE AS giorni_rimanenti,
  -- Priority score per sorting
  CASE sc.urgenza
    WHEN 'critica' THEN 100
    WHEN 'alta' THEN 75
    WHEN 'media' THEN 50
    WHEN 'bassa' THEN 25
    ELSE 10
  END +
  CASE
    WHEN sc.data_scadenza < CURRENT_DATE THEN 50
    WHEN sc.data_scadenza = CURRENT_DATE THEN 30
    WHEN sc.data_scadenza <= CURRENT_DATE + 3 THEN 15
    ELSE 0
  END AS priority_score
FROM scadenze sc
LEFT JOIN fascicoli f ON f.id = sc.fascicolo_id
LEFT JOIN profili p ON p.id = sc.assegnato_a;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. VISTA FATTURE PER CONTABILITA'
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE VIEW v_fatture_contabilita AS
SELECT
  fat.*,
  s.display_name AS cliente_nome,
  s.codice_fiscale AS cliente_cf,
  s.partita_iva AS cliente_piva,
  s.pec AS cliente_pec,
  f.oggetto AS fascicolo_oggetto,
  f.numero_interno AS fascicolo_numero,
  -- Stato pagamento
  CASE
    WHEN fat.stato = 'pagata' THEN 'pagata'
    WHEN fat.stato = 'annullata' THEN 'annullata'
    WHEN fat.data_scadenza_pagamento < CURRENT_DATE THEN 'scaduta'
    ELSE fat.stato
  END AS stato_effettivo,
  -- Giorni scaduta
  CASE WHEN fat.data_scadenza_pagamento < CURRENT_DATE AND fat.stato NOT IN ('pagata','annullata')
    THEN CURRENT_DATE - fat.data_scadenza_pagamento
    ELSE 0
  END AS giorni_scaduta,
  -- Pagamenti ricevuti
  COALESCE((SELECT SUM(importo) FROM pagamenti WHERE fattura_id = fat.id AND stato = 'confermato'), 0) AS totale_pagato,
  fat.totale_dovuto - COALESCE((SELECT SUM(importo) FROM pagamenti WHERE fattura_id = fat.id AND stato = 'confermato'), 0) AS residuo,
  -- Voci (JSON)
  (SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', fv.id, 'descrizione', fv.descrizione, 'tipo', fv.tipo,
    'quantita', fv.quantita, 'importo', fv.importo, 'fase', fv.fase
  ) ORDER BY fv.ordine), '[]'::JSONB) FROM fattura_voci fv WHERE fv.fattura_id = fat.id) AS voci_json
FROM fatture fat
LEFT JOIN soggetti s ON s.id = fat.cliente_id
LEFT JOIN fascicoli f ON f.id = fat.fascicolo_id;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. VISTA PRODUTTIVITA' TEAM
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE VIEW v_produttivita_team AS
SELECT
  p.studio_id,
  p.id AS profilo_id,
  p.nome || ' ' || p.cognome AS avvocato,
  p.ruolo,
  p.tariffa_oraria,
  p.obiettivo_ore_mensili,
  -- Mese corrente
  COALESCE(SUM(fa.durata_minuti) FILTER (WHERE fa.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE), 0) / 60.0 AS ore_mese_corrente,
  COALESCE(SUM(fa.durata_minuti) FILTER (WHERE fa.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE AND fa.fatturabile), 0) / 60.0 AS ore_fatturabili_mese,
  -- Target %
  CASE WHEN p.obiettivo_ore_mensili > 0
    THEN ROUND(COALESCE(SUM(fa.durata_minuti) FILTER (WHERE fa.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE), 0) / 60.0 / p.obiettivo_ore_mensili * 100, 1)
    ELSE 0
  END AS pct_target,
  -- Fascicoli attivi
  (SELECT COUNT(DISTINCT fascicolo_id) FROM fascicoli WHERE avvocato_responsabile = p.id AND stato IN ('aperto','in_corso')) AS fascicoli_attivi,
  -- Valore generato mese
  COALESCE(SUM(fa.importo) FILTER (WHERE fa.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE), 0) AS valore_generato_mese,
  -- Utilization rate
  CASE WHEN COALESCE(SUM(fa.durata_minuti) FILTER (WHERE fa.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE), 0) > 0
    THEN ROUND(
      COALESCE(SUM(fa.durata_minuti) FILTER (WHERE fa.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE AND fa.fatturabile), 0)::NUMERIC /
      NULLIF(COALESCE(SUM(fa.durata_minuti) FILTER (WHERE fa.data >= DATE_TRUNC('month', CURRENT_DATE)::DATE), 0), 0) * 100
    , 1) ELSE 0
  END AS utilization_rate
FROM profili p
LEFT JOIN fascicolo_attivita fa ON fa.profilo_id = p.id
WHERE p.is_active AND p.ruolo NOT IN ('segretaria', 'amministrativo')
GROUP BY p.id, p.studio_id, p.nome, p.cognome, p.ruolo, p.tariffa_oraria, p.obiettivo_ore_mensili;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. VISTA TREND MENSILE STUDIO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE VIEW v_trend_mensile AS
SELECT
  studio_id,
  data AS giorno,
  fascicoli_aperti,
  fatturato_giorno,
  incassato_giorno,
  ore_lavorate,
  nuovi_clienti,
  richieste_ai,
  -- Running totals (mese corrente)
  SUM(fatturato_giorno) OVER (PARTITION BY studio_id, DATE_TRUNC('month', data) ORDER BY data) AS fatturato_cumulativo_mese,
  SUM(incassato_giorno) OVER (PARTITION BY studio_id, DATE_TRUNC('month', data) ORDER BY data) AS incassato_cumulativo_mese,
  SUM(ore_lavorate) OVER (PARTITION BY studio_id, DATE_TRUNC('month', data) ORDER BY data) AS ore_cumulative_mese,
  -- Media mobile 7 giorni
  AVG(fatturato_giorno) OVER (PARTITION BY studio_id ORDER BY data ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS media_mobile_7gg_fatturato,
  AVG(ore_lavorate) OVER (PARTITION BY studio_id ORDER BY data ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS media_mobile_7gg_ore
FROM studio_statistiche_giornaliere
ORDER BY data DESC;
