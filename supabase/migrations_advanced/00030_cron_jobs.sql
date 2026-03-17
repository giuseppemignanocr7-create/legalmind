-- ============================================================================
-- 00030: CRON JOBS (pg_cron) — Automazioni Schedulate
-- Scadenze auto-check, refresh MV, pulizia, notifiche, backup metadata
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. MARK FATTURE SCADUTE (ogni giorno alle 06:00)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION cron_mark_fatture_scadute()
RETURNS VOID AS $$
BEGIN
  UPDATE fatture SET stato = 'scaduta'
  WHERE stato IN ('emessa','inviata_sdi','consegnata','accettata')
    AND data_scadenza_pagamento < CURRENT_DATE;
  
  -- Log
  INSERT INTO audit_log (studio_id, azione, entita, dati_nuovi, severity)
  SELECT DISTINCT studio_id, 'CRON_FATTURE_SCADUTE', 'fatture',
    jsonb_build_object('fatture_aggiornate', (
      SELECT COUNT(*) FROM fatture WHERE stato = 'scaduta' 
      AND data_scadenza_pagamento = CURRENT_DATE - 1
    )), 'info'
  FROM studi_legali;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule('mark-fatture-scadute', '0 6 * * *', 'SELECT cron_mark_fatture_scadute()');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. NOTIFICHE SCADENZE IMMINENTI (ogni giorno alle 07:00)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION cron_notifiche_scadenze()
RETURNS VOID AS $$
BEGIN
  -- Notifiche per scadenze di oggi
  INSERT INTO notifiche_inapp (studio_id, destinatario_id, tipo, titolo, messaggio, link)
  SELECT s.studio_id, COALESCE(s.assegnato_a, f.avvocato_responsabile),
    'scadenza', '📅 Scadenza OGGI: ' || s.titolo,
    'Fascicolo: ' || COALESCE(f.oggetto, 'N/A') || ' — ' || COALESCE(s.descrizione, ''),
    '/scadenziario'
  FROM scadenze s
  LEFT JOIN fascicoli f ON f.id = s.fascicolo_id
  WHERE s.stato = 'attiva' AND s.data_scadenza = CURRENT_DATE
    AND COALESCE(s.assegnato_a, f.avvocato_responsabile) IS NOT NULL;

  -- Notifiche per scadenze domani (urgenza alta/critica)
  INSERT INTO notifiche_inapp (studio_id, destinatario_id, tipo, titolo, messaggio, link)
  SELECT s.studio_id, COALESCE(s.assegnato_a, f.avvocato_responsabile),
    'scadenza', '⚠️ Scadenza DOMANI: ' || s.titolo,
    'Urgenza ' || s.urgenza || ' — Fascicolo: ' || COALESCE(f.oggetto, 'N/A'),
    '/scadenziario'
  FROM scadenze s
  LEFT JOIN fascicoli f ON f.id = s.fascicolo_id
  WHERE s.stato = 'attiva' AND s.data_scadenza = CURRENT_DATE + 1
    AND s.urgenza IN ('critica', 'alta')
    AND COALESCE(s.assegnato_a, f.avvocato_responsabile) IS NOT NULL;

  -- Notifiche per udienze di oggi
  INSERT INTO notifiche_inapp (studio_id, destinatario_id, tipo, titolo, messaggio, link)
  SELECT u.studio_id, u.avvocato_presente,
    'scadenza', '⚖️ Udienza OGGI: ' || u.tipo || ' - ' || u.autorita,
    COALESCE('Aula ' || u.aula || ' — ', '') || 'Fascicolo: ' || COALESCE(f.oggetto, 'N/A'),
    '/scadenziario'
  FROM udienze u
  LEFT JOIN fascicoli f ON f.id = u.fascicolo_id
  WHERE u.data_udienza::DATE = CURRENT_DATE AND u.avvocato_presente IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule('notifiche-scadenze', '0 7 * * *', 'SELECT cron_notifiche_scadenze()');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. REFRESH MATERIALIZED VIEWS (ogni 15 minuti)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT cron.schedule('refresh-mv', '*/15 * * * *', 'SELECT refresh_all_materialized_views()');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. PULIZIA AUDIT LOG VECCHI (ogni domenica alle 03:00)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT cron.schedule('cleanup-audit', '0 3 * * 0', 'SELECT cleanup_audit_log(365)');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. PULIZIA NOTIFICHE LETTE VECCHIE (ogni sabato alle 04:00)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION cron_cleanup_notifiche()
RETURNS VOID AS $$
BEGIN
  DELETE FROM notifiche_inapp
  WHERE letta = true AND created_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM notifiche_inapp
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule('cleanup-notifiche', '0 4 * * 6', 'SELECT cron_cleanup_notifiche()');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. STATISTICHE GIORNALIERE STUDIO (ogni sera alle 23:00)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS studio_statistiche_giornaliere (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  data DATE NOT NULL,
  fascicoli_aperti INT DEFAULT 0,
  fascicoli_chiusi_oggi INT DEFAULT 0,
  scadenze_completate_oggi INT DEFAULT 0,
  udienze_svolte_oggi INT DEFAULT 0,
  ore_lavorate NUMERIC DEFAULT 0,
  fatturato_giorno NUMERIC DEFAULT 0,
  incassato_giorno NUMERIC DEFAULT 0,
  nuovi_clienti INT DEFAULT 0,
  atti_creati INT DEFAULT 0,
  richieste_ai INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(studio_id, data)
);

ALTER TABLE studio_statistiche_giornaliere ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats_select" ON studio_statistiche_giornaliere FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE OR REPLACE FUNCTION cron_daily_statistics()
RETURNS VOID AS $$
BEGIN
  INSERT INTO studio_statistiche_giornaliere (studio_id, data, fascicoli_aperti, fascicoli_chiusi_oggi,
    scadenze_completate_oggi, udienze_svolte_oggi, ore_lavorate, fatturato_giorno, incassato_giorno,
    nuovi_clienti, atti_creati, richieste_ai)
  SELECT
    s.id,
    CURRENT_DATE,
    (SELECT COUNT(*) FROM fascicoli WHERE studio_id = s.id AND stato IN ('aperto','in_corso')),
    (SELECT COUNT(*) FROM fascicoli WHERE studio_id = s.id AND data_chiusura = CURRENT_DATE),
    (SELECT COUNT(*) FROM scadenze WHERE studio_id = s.id AND stato = 'completata' AND updated_at::DATE = CURRENT_DATE),
    (SELECT COUNT(*) FROM udienze WHERE studio_id = s.id AND data_udienza::DATE = CURRENT_DATE),
    COALESCE((SELECT SUM(durata_minuti)/60.0 FROM fascicolo_attivita WHERE studio_id = s.id AND data = CURRENT_DATE), 0),
    COALESCE((SELECT SUM(totale_dovuto) FROM fatture WHERE studio_id = s.id AND data_emissione = CURRENT_DATE), 0),
    COALESCE((SELECT SUM(importo) FROM pagamenti WHERE studio_id = s.id AND data_pagamento = CURRENT_DATE AND stato = 'confermato'), 0),
    (SELECT COUNT(*) FROM soggetti WHERE studio_id = s.id AND tipo_soggetto = 'cliente' AND created_at::DATE = CURRENT_DATE),
    (SELECT COUNT(*) FROM atti WHERE studio_id = s.id AND created_at::DATE = CURRENT_DATE),
    COALESCE((SELECT SUM(richieste) FROM ai_usage WHERE studio_id = s.id AND data = CURRENT_DATE), 0)
  FROM studi_legali s
  ON CONFLICT (studio_id, data) DO UPDATE SET
    fascicoli_aperti = EXCLUDED.fascicoli_aperti,
    fascicoli_chiusi_oggi = EXCLUDED.fascicoli_chiusi_oggi,
    scadenze_completate_oggi = EXCLUDED.scadenze_completate_oggi,
    udienze_svolte_oggi = EXCLUDED.udienze_svolte_oggi,
    ore_lavorate = EXCLUDED.ore_lavorate,
    fatturato_giorno = EXCLUDED.fatturato_giorno,
    incassato_giorno = EXCLUDED.incassato_giorno,
    nuovi_clienti = EXCLUDED.nuovi_clienti,
    atti_creati = EXCLUDED.atti_creati,
    richieste_ai = EXCLUDED.richieste_ai;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule('daily-statistics', '0 23 * * *', 'SELECT cron_daily_statistics()');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. SUBSCRIPTION EXPIRY CHECK (ogni giorno alle 08:00)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION cron_check_subscriptions()
RETURNS VOID AS $$
BEGIN
  -- Notify studios with expiring subscriptions (7 days before)
  INSERT INTO notifiche_inapp (studio_id, destinatario_id, tipo, titolo, messaggio, link)
  SELECT s.id, p.id, 'sistema',
    '🔔 Abbonamento in scadenza',
    'Il tuo piano ' || s.subscription || ' scade il ' || to_char(s.subscription_expires_at, 'DD/MM/YYYY') || '. Rinnova per continuare.',
    '/impostazioni'
  FROM studi_legali s
  JOIN profili p ON p.studio_id = s.id AND p.ruolo = 'titolare'
  WHERE s.subscription_expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM notifiche_inapp n
      WHERE n.studio_id = s.id AND n.tipo = 'sistema' AND n.titolo LIKE '%Abbonamento%'
      AND n.created_at > NOW() - INTERVAL '1 day'
    );

  -- Downgrade expired subscriptions
  UPDATE studi_legali SET subscription = 'starter'
  WHERE subscription != 'starter' AND subscription_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule('check-subscriptions', '0 8 * * *', 'SELECT cron_check_subscriptions()');
