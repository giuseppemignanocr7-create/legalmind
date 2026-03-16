-- 00019_functions.sql

-- Calcolo automatico totale fattura
CREATE OR REPLACE FUNCTION calcola_totale_fattura()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fatture SET
    imponibile = (SELECT COALESCE(SUM(importo), 0) FROM fattura_voci WHERE fattura_id = NEW.fattura_id AND tipo = 'compenso'),
    spese_esenti = (SELECT COALESCE(SUM(importo), 0) FROM fattura_voci WHERE fattura_id = NEW.fattura_id AND tipo = 'spesa_esente'),
    spese_imponibili = (SELECT COALESCE(SUM(importo), 0) FROM fattura_voci WHERE fattura_id = NEW.fattura_id AND tipo = 'spesa_imponibile'),
    updated_at = NOW()
  WHERE id = NEW.fattura_id;

  UPDATE fatture SET
    cpa = (imponibile + spese_imponibili) * 0.04,
    iva_importo = (imponibile + spese_imponibili + cpa) * (iva_aliquota / 100),
    ritenuta_importo = imponibile * (ritenuta_aliquota / 100),
    totale_documento = imponibile + spese_imponibili + spese_esenti + cpa + iva_importo + bollo,
    totale_dovuto = imponibile + spese_imponibili + spese_esenti + cpa + iva_importo + bollo - ritenuta_importo,
    updated_at = NOW()
  WHERE id = NEW.fattura_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Conflict check function
CREATE OR REPLACE FUNCTION check_conflicts(
  p_studio_id UUID,
  p_soggetto_nome TEXT,
  p_codice_fiscale TEXT DEFAULT NULL
)
RETURNS TABLE(
  soggetto_id UUID,
  display_name TEXT,
  fascicoli_coinvolti JSONB,
  tipo_conflitto TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.display_name,
    jsonb_agg(jsonb_build_object(
      'fascicolo_id', fp.fascicolo_id,
      'ruolo', fp.ruolo,
      'numero', f.numero_interno
    )) AS fascicoli_coinvolti,
    CASE
      WHEN fp.ruolo IN ('controparte', 'imputato') THEN 'CONFLITTO DIRETTO'
      WHEN fp.ruolo IN ('terzo_chiamato', 'interveniente') THEN 'POTENZIALE CONFLITTO'
      ELSE 'COLLEGAMENTO'
    END AS tipo_conflitto
  FROM soggetti s
  JOIN fascicolo_parti fp ON fp.soggetto_id = s.id
  JOIN fascicoli f ON f.id = fp.fascicolo_id
  WHERE s.studio_id = p_studio_id
    AND (
      s.display_name ILIKE '%' || p_soggetto_nome || '%'
      OR (p_codice_fiscale IS NOT NULL AND s.codice_fiscale = p_codice_fiscale)
    )
  GROUP BY s.id, s.display_name, fp.ruolo;
END;
$$ LANGUAGE plpgsql;

-- Calcolo termini processuali con sospensione feriale
CREATE OR REPLACE FUNCTION calcola_termine(
  p_data_inizio DATE,
  p_giorni INT,
  p_sospensione_feriale BOOLEAN DEFAULT true
)
RETURNS DATE AS $$
DECLARE
  v_data_fine DATE;
  v_anno INT;
  v_sospensione_inizio DATE;
  v_sospensione_fine DATE;
  v_giorni_sospensione INT;
BEGIN
  v_data_fine := p_data_inizio + p_giorni;

  IF p_sospensione_feriale THEN
    FOR v_anno IN EXTRACT(YEAR FROM p_data_inizio)::INT..EXTRACT(YEAR FROM v_data_fine)::INT LOOP
      v_sospensione_inizio := (v_anno || '-08-01')::DATE;
      v_sospensione_fine := (v_anno || '-08-31')::DATE;

      IF p_data_inizio < v_sospensione_fine AND v_data_fine > v_sospensione_inizio THEN
        v_giorni_sospensione := LEAST(v_data_fine, v_sospensione_fine) -
                                 GREATEST(p_data_inizio, v_sospensione_inizio);
        IF v_giorni_sospensione > 0 THEN
          v_data_fine := v_data_fine + v_giorni_sospensione;
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN v_data_fine;
END;
$$ LANGUAGE plpgsql;

-- Increment AI usage (upsert)
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_studio_id UUID,
  p_profilo_id UUID,
  p_data DATE,
  p_tokens_in INT,
  p_tokens_out INT,
  p_costo DECIMAL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_usage (studio_id, profilo_id, data, tokens_input, tokens_output, richieste, costo_stimato)
  VALUES (p_studio_id, p_profilo_id, p_data, p_tokens_in, p_tokens_out, 1, p_costo)
  ON CONFLICT (studio_id, profilo_id, data)
  DO UPDATE SET
    tokens_input = ai_usage.tokens_input + p_tokens_in,
    tokens_output = ai_usage.tokens_output + p_tokens_out,
    richieste = ai_usage.richieste + 1,
    costo_stimato = ai_usage.costo_stimato + p_costo;
END;
$$ LANGUAGE plpgsql;
