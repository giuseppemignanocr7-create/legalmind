-- ============================================================================
-- 00027: ADVANCED DATABASE FUNCTIONS — Business Logic Engine
-- Calcoli avanzati, statistiche, automazioni, reporting server-side
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. DASHBOARD KPI REALTIME (bypasses materialized view for fresh data)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION get_dashboard_kpi(p_studio_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'fascicoli', jsonb_build_object(
      'attivi', COUNT(*) FILTER (WHERE stato IN ('aperto','in_corso')),
      'vinti', COUNT(*) FILTER (WHERE stato = 'chiuso_vinto'),
      'persi', COUNT(*) FILTER (WHERE stato = 'chiuso_perso'),
      'transatti', COUNT(*) FILTER (WHERE stato = 'chiuso_transatto'),
      'totali', COUNT(*),
      'tasso_successo', ROUND(
        COUNT(*) FILTER (WHERE stato = 'chiuso_vinto')::NUMERIC /
        NULLIF(COUNT(*) FILTER (WHERE stato IN ('chiuso_vinto','chiuso_perso')), 0) * 100, 1
      )
    ),
    'scadenze', jsonb_build_object(
      'scadute', (SELECT COUNT(*) FROM scadenze WHERE studio_id = p_studio_id AND stato = 'attiva' AND data_scadenza < CURRENT_DATE),
      'oggi', (SELECT COUNT(*) FROM scadenze WHERE studio_id = p_studio_id AND stato = 'attiva' AND data_scadenza = CURRENT_DATE),
      'prossimi_7gg', (SELECT COUNT(*) FROM scadenze WHERE studio_id = p_studio_id AND stato = 'attiva' AND data_scadenza BETWEEN CURRENT_DATE AND CURRENT_DATE + 7),
      'prossimi_30gg', (SELECT COUNT(*) FROM scadenze WHERE studio_id = p_studio_id AND stato = 'attiva' AND data_scadenza BETWEEN CURRENT_DATE AND CURRENT_DATE + 30)
    ),
    'fatturato', (
      SELECT jsonb_build_object(
        'anno_corrente', COALESCE(SUM(totale_dovuto) FILTER (WHERE EXTRACT(YEAR FROM data_emissione) = EXTRACT(YEAR FROM CURRENT_DATE)), 0),
        'mese_corrente', COALESCE(SUM(totale_dovuto) FILTER (WHERE DATE_TRUNC('month', data_emissione) = DATE_TRUNC('month', CURRENT_DATE)), 0),
        'da_incassare', COALESCE(SUM(totale_dovuto) FILTER (WHERE stato IN ('emessa','inviata_sdi','consegnata','accettata','scaduta')), 0),
        'incassato_anno', COALESCE(SUM(totale_dovuto) FILTER (WHERE stato = 'pagata' AND EXTRACT(YEAR FROM data_emissione) = EXTRACT(YEAR FROM CURRENT_DATE)), 0)
      ) FROM fatture WHERE studio_id = p_studio_id
    ),
    'clienti', jsonb_build_object(
      'totali', (SELECT COUNT(*) FROM soggetti WHERE studio_id = p_studio_id AND tipo_soggetto = 'cliente'),
      'nuovi_mese', (SELECT COUNT(*) FROM soggetti WHERE studio_id = p_studio_id AND tipo_soggetto = 'cliente' AND created_at > DATE_TRUNC('month', CURRENT_DATE))
    ),
    'udienze_prossime', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', u.id, 'data', u.data_udienza, 'tipo', u.tipo, 'autorita', u.autorita,
        'fascicolo', f.oggetto, 'avvocato', p.nome || ' ' || p.cognome
      ) ORDER BY u.data_udienza ASC), '[]'::JSONB)
      FROM udienze u
      LEFT JOIN fascicoli f ON f.id = u.fascicolo_id
      LEFT JOIN profili p ON p.id = u.avvocato_presente
      WHERE u.studio_id = p_studio_id AND u.data_udienza >= NOW()
      LIMIT 5
    ),
    'timestamp', NOW()
  ) INTO result
  FROM fascicoli WHERE studio_id = p_studio_id;
  
  RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. FASCICOLO TIMELINE (storia completa di un fascicolo)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION get_fascicolo_timeline(p_fascicolo_id UUID)
RETURNS TABLE(
  tipo TEXT,
  titolo TEXT,
  descrizione TEXT,
  data TIMESTAMPTZ,
  autore TEXT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  -- Eventi fascicolo
  (SELECT 'evento'::TEXT, fe.tipo_evento, fe.descrizione, fe.data_evento, 
   p.nome || ' ' || p.cognome, fe.metadata
   FROM fascicolo_eventi fe LEFT JOIN profili p ON p.id = fe.creato_da
   WHERE fe.fascicolo_id = p_fascicolo_id)
  UNION ALL
  -- Atti
  (SELECT 'atto'::TEXT, a.titolo, a.tipo_atto, a.created_at,
   p.nome || ' ' || p.cognome, jsonb_build_object('stato', a.stato, 'versione', a.versione)
   FROM atti a LEFT JOIN profili p ON p.id = a.redattore_id
   WHERE a.fascicolo_id = p_fascicolo_id)
  UNION ALL
  -- Scadenze
  (SELECT 'scadenza'::TEXT, s.titolo, s.descrizione, s.data_scadenza::TIMESTAMPTZ,
   p.nome || ' ' || p.cognome, jsonb_build_object('stato', s.stato, 'urgenza', s.urgenza)
   FROM scadenze s LEFT JOIN profili p ON p.id = s.assegnato_a
   WHERE s.fascicolo_id = p_fascicolo_id)
  UNION ALL
  -- Udienze
  (SELECT 'udienza'::TEXT, u.tipo || ' - ' || u.autorita, u.esito, u.data_udienza,
   p.nome || ' ' || p.cognome, jsonb_build_object('aula', u.aula, 'giudice', u.giudice)
   FROM udienze u LEFT JOIN profili p ON p.id = u.avvocato_presente
   WHERE u.fascicolo_id = p_fascicolo_id)
  UNION ALL
  -- Documenti
  (SELECT 'documento'::TEXT, d.nome_file, d.categoria, d.created_at,
   p.nome || ' ' || p.cognome, jsonb_build_object('size', d.dimensione, 'tipo', d.tipo_file)
   FROM documenti d LEFT JOIN profili p ON p.id = d.caricato_da
   WHERE d.fascicolo_id = p_fascicolo_id)
  UNION ALL
  -- Attività (time tracking)
  (SELECT 'attivita'::TEXT, fa.descrizione, fa.tipo_attivita, fa.data::TIMESTAMPTZ,
   p.nome || ' ' || p.cognome, jsonb_build_object('minuti', fa.durata_minuti, 'fatturabile', fa.fatturabile, 'importo', fa.importo)
   FROM fascicolo_attivita fa LEFT JOIN profili p ON p.id = fa.profilo_id
   WHERE fa.fascicolo_id = p_fascicolo_id)
  ORDER BY data DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. GENERAZIONE NUMERO FATTURA PROGRESSIVO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION genera_numero_fattura(p_studio_id UUID, p_tipo TEXT DEFAULT 'FPA')
RETURNS TEXT AS $$
DECLARE
  v_anno INT := EXTRACT(YEAR FROM CURRENT_DATE);
  v_progressivo INT;
  v_formato TEXT;
BEGIN
  -- Get next progressive for this studio and year
  SELECT COALESCE(MAX(
    CASE WHEN numero ~ '^\d{4}/\d+' 
    THEN SPLIT_PART(numero, '/', 2)::INT
    ELSE 0 END
  ), 0) + 1 INTO v_progressivo
  FROM fatture
  WHERE studio_id = p_studio_id 
    AND EXTRACT(YEAR FROM data_emissione) = v_anno;

  -- Apply studio numbering format
  SELECT COALESCE(settings->>'numerazione_fatture', 'YYYY/NNNN') INTO v_formato
  FROM studi_legali WHERE id = p_studio_id;
  
  RETURN v_anno || '/' || LPAD(v_progressivo::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. GENERAZIONE NUMERO FASCICOLO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION genera_numero_fascicolo(p_studio_id UUID, p_materia TEXT)
RETURNS TEXT AS $$
DECLARE
  v_anno INT := EXTRACT(YEAR FROM CURRENT_DATE);
  v_progressivo INT;
  v_materia_code TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CASE WHEN numero_interno ~ '^\d{4}/\d+' 
    THEN SPLIT_PART(SPLIT_PART(numero_interno, '/', 2), '-', 1)::INT
    ELSE 0 END
  ), 0) + 1 INTO v_progressivo
  FROM fascicoli
  WHERE studio_id = p_studio_id 
    AND EXTRACT(YEAR FROM data_apertura) = v_anno;

  v_materia_code := UPPER(LEFT(p_materia, 3));
  RETURN v_anno || '/' || LPAD(v_progressivo::TEXT, 4, '0') || '-' || v_materia_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. REPORT FATTURATO CLIENT-SIDE READY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION report_fatturato(
  p_studio_id UUID,
  p_anno INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INT,
  p_mese INT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'periodo', jsonb_build_object('anno', p_anno, 'mese', p_mese),
    'riepilogo', jsonb_build_object(
      'fatturato_lordo', COALESCE(SUM(totale_documento), 0),
      'fatturato_netto', COALESCE(SUM(totale_dovuto), 0),
      'totale_iva', COALESCE(SUM(iva_importo), 0),
      'totale_cpa', COALESCE(SUM(cpa), 0),
      'totale_ritenuta', COALESCE(SUM(ritenuta_importo), 0),
      'numero_fatture', COUNT(*),
      'media_fattura', ROUND(COALESCE(AVG(totale_dovuto), 0), 2),
      'incassato', COALESCE(SUM(totale_dovuto) FILTER (WHERE stato = 'pagata'), 0),
      'da_incassare', COALESCE(SUM(totale_dovuto) FILTER (WHERE stato NOT IN ('pagata','annullata','nota_credito')), 0)
    ),
    'per_cliente', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'cliente_id', cliente_id,
        'cliente_nome', s.display_name,
        'fatturato', SUM(f.totale_dovuto),
        'fatture', COUNT(*)
      ) ORDER BY SUM(f.totale_dovuto) DESC), '[]'::JSONB)
      FROM fatture f
      LEFT JOIN soggetti s ON s.id = f.cliente_id
      WHERE f.studio_id = p_studio_id
        AND EXTRACT(YEAR FROM f.data_emissione) = p_anno
        AND (p_mese IS NULL OR EXTRACT(MONTH FROM f.data_emissione) = p_mese)
      GROUP BY f.cliente_id, s.display_name
    ),
    'per_materia', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'materia', fasc.materia,
        'fatturato', SUM(f.totale_dovuto),
        'fatture', COUNT(*)
      ) ORDER BY SUM(f.totale_dovuto) DESC), '[]'::JSONB)
      FROM fatture f
      LEFT JOIN fascicoli fasc ON fasc.id = f.fascicolo_id
      WHERE f.studio_id = p_studio_id
        AND EXTRACT(YEAR FROM f.data_emissione) = p_anno
        AND (p_mese IS NULL OR EXTRACT(MONTH FROM f.data_emissione) = p_mese)
      GROUP BY fasc.materia
    ),
    'generato_il', NOW()
  ) INTO result
  FROM fatture
  WHERE studio_id = p_studio_id
    AND EXTRACT(YEAR FROM data_emissione) = p_anno
    AND (p_mese IS NULL OR EXTRACT(MONTH FROM data_emissione) = p_mese);

  RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. SCADENZE SMART ALERT (prossime scadenze con contesto)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION get_scadenze_alert(p_studio_id UUID, p_giorni INT DEFAULT 7)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', s.id,
      'titolo', s.titolo,
      'tipo', s.tipo,
      'urgenza', s.urgenza,
      'data_scadenza', s.data_scadenza,
      'ora_scadenza', s.ora_scadenza,
      'giorni_mancanti', s.data_scadenza - CURRENT_DATE,
      'scaduta', s.data_scadenza < CURRENT_DATE,
      'fascicolo', jsonb_build_object('id', f.id, 'oggetto', f.oggetto, 'numero', f.numero_interno),
      'assegnato_a', jsonb_build_object('id', p.id, 'nome', p.nome || ' ' || p.cognome),
      'priorita_score', 
        CASE s.urgenza
          WHEN 'critica' THEN 100
          WHEN 'alta' THEN 75
          WHEN 'media' THEN 50
          WHEN 'bassa' THEN 25
          ELSE 10
        END + 
        CASE WHEN s.data_scadenza < CURRENT_DATE THEN 50 
             WHEN s.data_scadenza = CURRENT_DATE THEN 30
             ELSE 0 END
    ) ORDER BY s.data_scadenza ASC), '[]'::JSONB)
    FROM scadenze s
    LEFT JOIN fascicoli f ON f.id = s.fascicolo_id
    LEFT JOIN profili p ON p.id = s.assegnato_a
    WHERE s.studio_id = p_studio_id
      AND s.stato = 'attiva'
      AND s.data_scadenza <= CURRENT_DATE + p_giorni
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. CLIENT HEALTH SCORE (scoring cliente per prioritizzazione)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION calcola_client_health_score(p_cliente_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_score INT := 50;
  v_details JSONB;
  v_fatture_pagate INT;
  v_fatture_scadute INT;
  v_fascicoli_attivi INT;
  v_valore_totale NUMERIC;
  v_giorni_ultima_attivita INT;
BEGIN
  -- Fatture pagate vs scadute
  SELECT 
    COUNT(*) FILTER (WHERE stato = 'pagata'),
    COUNT(*) FILTER (WHERE stato = 'scaduta')
  INTO v_fatture_pagate, v_fatture_scadute
  FROM fatture WHERE cliente_id = p_cliente_id;

  -- Fascicoli attivi
  SELECT COUNT(*) INTO v_fascicoli_attivi
  FROM fascicolo_parti fp JOIN fascicoli f ON f.id = fp.fascicolo_id
  WHERE fp.soggetto_id = p_cliente_id AND f.stato IN ('aperto','in_corso');

  -- Valore totale
  SELECT COALESCE(SUM(totale_dovuto), 0) INTO v_valore_totale
  FROM fatture WHERE cliente_id = p_cliente_id;

  -- Ultima attività
  SELECT COALESCE(CURRENT_DATE - MAX(created_at)::DATE, 999) INTO v_giorni_ultima_attivita
  FROM fascicolo_attivita fa
  JOIN fascicolo_parti fp ON fp.fascicolo_id = fa.fascicolo_id
  WHERE fp.soggetto_id = p_cliente_id;

  -- Calculate score
  IF v_fatture_pagate > 0 THEN v_score := v_score + LEAST(v_fatture_pagate * 5, 20); END IF;
  IF v_fatture_scadute > 0 THEN v_score := v_score - v_fatture_scadute * 10; END IF;
  IF v_fascicoli_attivi > 0 THEN v_score := v_score + 10; END IF;
  IF v_valore_totale > 10000 THEN v_score := v_score + 10; END IF;
  IF v_giorni_ultima_attivita < 30 THEN v_score := v_score + 10;
  ELSIF v_giorni_ultima_attivita > 180 THEN v_score := v_score - 15; END IF;

  v_score := GREATEST(0, LEAST(100, v_score));

  RETURN jsonb_build_object(
    'score', v_score,
    'livello', CASE 
      WHEN v_score >= 80 THEN 'eccellente'
      WHEN v_score >= 60 THEN 'buono'
      WHEN v_score >= 40 THEN 'attenzione'
      ELSE 'critico'
    END,
    'dettagli', jsonb_build_object(
      'fatture_pagate', v_fatture_pagate,
      'fatture_scadute', v_fatture_scadute,
      'fascicoli_attivi', v_fascicoli_attivi,
      'valore_totale', v_valore_totale,
      'giorni_ultima_attivita', v_giorni_ultima_attivita
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. SEARCH EVERYTHING (global search potenziata)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION search_everything(
  p_studio_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 20
)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'risultati', COALESCE(jsonb_agg(r ORDER BY r->>'rank' DESC), '[]'::JSONB),
      'totale', COUNT(*),
      'query', p_query,
      'tempo_ms', EXTRACT(MILLISECOND FROM clock_timestamp() - statement_timestamp())::INT
    )
    FROM (
      -- Fascicoli
      SELECT jsonb_build_object(
        'tipo', 'fascicolo', 'id', id, 'titolo', oggetto,
        'sottotitolo', numero_interno || ' — ' || stato,
        'rank', ts_rank(search_vector, websearch_to_tsquery('italian', p_query))
      ) AS r FROM fascicoli
      WHERE studio_id = p_studio_id AND (
        search_vector @@ websearch_to_tsquery('italian', p_query)
        OR oggetto ILIKE '%' || p_query || '%'
        OR numero_interno ILIKE '%' || p_query || '%'
        OR numero_rg ILIKE '%' || p_query || '%'
      )
      UNION ALL
      -- Clienti
      SELECT jsonb_build_object(
        'tipo', 'cliente', 'id', id, 'titolo', display_name,
        'sottotitolo', COALESCE(codice_fiscale, partita_iva, email),
        'rank', ts_rank(search_vector, websearch_to_tsquery('italian', p_query))
      ) FROM soggetti
      WHERE studio_id = p_studio_id AND tipo_soggetto = 'cliente' AND (
        search_vector @@ websearch_to_tsquery('italian', p_query)
        OR display_name ILIKE '%' || p_query || '%'
        OR codice_fiscale ILIKE '%' || p_query || '%'
        OR partita_iva ILIKE '%' || p_query || '%'
      )
      UNION ALL
      -- Atti
      SELECT jsonb_build_object(
        'tipo', 'atto', 'id', id, 'titolo', titolo,
        'sottotitolo', tipo_atto || ' — ' || stato,
        'rank', ts_rank(search_vector, websearch_to_tsquery('italian', p_query))
      ) FROM atti
      WHERE studio_id = p_studio_id AND (
        search_vector @@ websearch_to_tsquery('italian', p_query)
        OR titolo ILIKE '%' || p_query || '%'
      )
      UNION ALL
      -- Fatture
      SELECT jsonb_build_object(
        'tipo', 'fattura', 'id', f.id, 'titolo', 'Fattura ' || f.numero,
        'sottotitolo', s.display_name || ' — €' || f.totale_dovuto,
        'rank', 0.5
      ) FROM fatture f LEFT JOIN soggetti s ON s.id = f.cliente_id
      WHERE f.studio_id = p_studio_id AND (
        f.numero ILIKE '%' || p_query || '%'
        OR s.display_name ILIKE '%' || p_query || '%'
      )
      LIMIT p_limit
    ) sub
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
