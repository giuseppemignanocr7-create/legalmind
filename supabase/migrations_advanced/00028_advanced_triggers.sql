-- ============================================================================
-- 00028: ADVANCED TRIGGERS — Automazioni Business Logic
-- Cascata di trigger per integrità, notifiche, calcoli automatici
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. AUTO-AGGIORNAMENTO STATO FASCICOLO
-- Quando tutte le scadenze sono completate e non ci sono udienze future
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION auto_update_fascicolo_stato()
RETURNS TRIGGER AS $$
DECLARE
  v_scadenze_attive INT;
  v_udienze_future INT;
  v_fascicolo_stato TEXT;
BEGIN
  -- Only for scadenze state changes
  IF TG_TABLE_NAME = 'scadenze' AND NEW.stato != OLD.stato THEN
    SELECT COUNT(*) INTO v_scadenze_attive
    FROM scadenze WHERE fascicolo_id = NEW.fascicolo_id AND stato = 'attiva';
    
    SELECT COUNT(*) INTO v_udienze_future
    FROM udienze WHERE fascicolo_id = NEW.fascicolo_id AND data_udienza > NOW();
    
    SELECT stato INTO v_fascicolo_stato FROM fascicoli WHERE id = NEW.fascicolo_id;
    
    -- If no active deadlines and no future hearings, suggest review
    IF v_scadenze_attive = 0 AND v_udienze_future = 0 AND v_fascicolo_stato = 'in_corso' THEN
      INSERT INTO fascicolo_eventi (fascicolo_id, studio_id, tipo_evento, descrizione, data_evento)
      SELECT NEW.fascicolo_id, NEW.studio_id, 'nota',
        'Tutte le scadenze completate e nessuna udienza futura — valutare chiusura fascicolo',
        NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fascicolo_auto_stato
  AFTER UPDATE ON scadenze
  FOR EACH ROW EXECUTE FUNCTION auto_update_fascicolo_stato();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. AUTO-GENERA EVENTO FASCICOLO SU CAMBIO STATO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION auto_evento_cambio_stato()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stato IS DISTINCT FROM NEW.stato THEN
    INSERT INTO fascicolo_eventi (
      fascicolo_id, studio_id, tipo_evento, descrizione, data_evento,
      creato_da, metadata
    ) VALUES (
      NEW.id, NEW.studio_id, 'cambio_stato',
      'Stato cambiato da "' || OLD.stato || '" a "' || NEW.stato || '"',
      NOW(), auth.uid(),
      jsonb_build_object('stato_precedente', OLD.stato, 'stato_nuovo', NEW.stato)
    );
  END IF;
  
  IF OLD.avvocato_responsabile IS DISTINCT FROM NEW.avvocato_responsabile THEN
    INSERT INTO fascicolo_eventi (
      fascicolo_id, studio_id, tipo_evento, descrizione, data_evento,
      creato_da, metadata
    ) VALUES (
      NEW.id, NEW.studio_id, 'assegnazione',
      'Avvocato responsabile cambiato',
      NOW(), auth.uid(),
      jsonb_build_object('precedente', OLD.avvocato_responsabile, 'nuovo', NEW.avvocato_responsabile)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fascicolo_evento_stato
  AFTER UPDATE ON fascicoli
  FOR EACH ROW EXECUTE FUNCTION auto_evento_cambio_stato();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. FATTURA: AUTO-STATO SU PAGAMENTO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION auto_stato_fattura_pagamento()
RETURNS TRIGGER AS $$
DECLARE
  v_totale_pagato NUMERIC;
  v_totale_dovuto NUMERIC;
BEGIN
  SELECT SUM(importo) INTO v_totale_pagato
  FROM pagamenti WHERE fattura_id = NEW.fattura_id AND stato = 'confermato';
  
  SELECT totale_dovuto INTO v_totale_dovuto
  FROM fatture WHERE id = NEW.fattura_id;
  
  IF v_totale_pagato >= v_totale_dovuto THEN
    UPDATE fatture SET stato = 'pagata', data_pagamento = NEW.data_pagamento
    WHERE id = NEW.fattura_id;
  ELSIF v_totale_pagato > 0 THEN
    UPDATE fatture SET stato = 'parzialmente_pagata'
    WHERE id = NEW.fattura_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pagamento_stato_fattura
  AFTER INSERT OR UPDATE ON pagamenti
  FOR EACH ROW EXECUTE FUNCTION auto_stato_fattura_pagamento();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. FATTURA: AUTO-SCADENZA PAGAMENTO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION auto_scadenza_fattura()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stato = 'emessa' AND OLD.stato != 'emessa' THEN
    -- Crea scadenza per pagamento (default 30 giorni)
    INSERT INTO scadenze (
      studio_id, fascicolo_id, tipo, titolo, descrizione,
      data_scadenza, urgenza, alert_email, alert_push
    ) VALUES (
      NEW.studio_id, NEW.fascicolo_id, 'pagamento',
      'Scadenza pagamento Fattura ' || NEW.numero,
      'Fattura ' || NEW.numero || ' — €' || NEW.totale_dovuto,
      COALESCE(NEW.data_scadenza_pagamento, NEW.data_emissione + INTERVAL '30 days'),
      'media', true, true
    );
  END IF;
  
  -- Auto-mark scadute
  IF NEW.data_scadenza_pagamento < CURRENT_DATE AND NEW.stato IN ('emessa','inviata_sdi','consegnata','accettata') THEN
    NEW.stato := 'scaduta';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fattura_scadenza
  AFTER UPDATE ON fatture
  FOR EACH ROW EXECUTE FUNCTION auto_scadenza_fattura();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. DOCUMENTO: AUTO-VERSIONING
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION auto_version_documento()
RETURNS TRIGGER AS $$
DECLARE
  v_max_version INT;
BEGIN
  IF NEW.nome_file IS DISTINCT FROM OLD.nome_file OR NEW.storage_path IS DISTINCT FROM OLD.storage_path THEN
    SELECT COALESCE(MAX(versione), 0) + 1 INTO v_max_version
    FROM documenti WHERE fascicolo_id = NEW.fascicolo_id AND nome_file = NEW.nome_file;
    
    NEW.versione := v_max_version;
    NEW.hash_sha256 := encode(sha256(NEW.storage_path::bytea), 'hex');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_documento_versioning
  BEFORE UPDATE ON documenti
  FOR EACH ROW EXECUTE FUNCTION auto_version_documento();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. NOTIFICA IN-APP SU EVENTI CRITICI
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS notifiche_inapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  destinatario_id UUID NOT NULL REFERENCES profili(id),
  tipo TEXT NOT NULL, -- 'scadenza', 'assegnazione', 'pagamento', 'sistema'
  titolo TEXT NOT NULL,
  messaggio TEXT,
  link TEXT,
  letta BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifiche_inapp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifiche_select" ON notifiche_inapp FOR SELECT
  USING (destinatario_id = auth.uid());

CREATE POLICY "notifiche_update" ON notifiche_inapp FOR UPDATE
  USING (destinatario_id = auth.uid());

CREATE INDEX idx_notifiche_dest ON notifiche_inapp(destinatario_id, letta, created_at DESC);

CREATE OR REPLACE FUNCTION notify_scadenza_critica()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify on critical/high urgency deadlines approaching
  IF NEW.urgenza IN ('critica', 'alta') AND NEW.stato = 'attiva' 
     AND NEW.data_scadenza <= CURRENT_DATE + 3 THEN
    INSERT INTO notifiche_inapp (studio_id, destinatario_id, tipo, titolo, messaggio, link)
    VALUES (
      NEW.studio_id, 
      COALESCE(NEW.assegnato_a, (SELECT id FROM profili WHERE studio_id = NEW.studio_id AND ruolo = 'titolare' LIMIT 1)),
      'scadenza',
      '⚠️ Scadenza ' || NEW.urgenza || ': ' || NEW.titolo,
      'Scadenza il ' || to_char(NEW.data_scadenza, 'DD/MM/YYYY') || 
        CASE WHEN NEW.data_scadenza < CURRENT_DATE THEN ' — GIA'' SCADUTA!' ELSE '' END,
      '/scadenziario'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_scadenza
  AFTER INSERT OR UPDATE ON scadenze
  FOR EACH ROW EXECUTE FUNCTION notify_scadenza_critica();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. AUTO-CALCOLO IMPORTO ATTIVITA' (tariffa oraria × durata)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION auto_calcolo_importo_attivita()
RETURNS TRIGGER AS $$
DECLARE
  v_tariffa NUMERIC;
BEGIN
  IF NEW.importo IS NULL OR NEW.importo = 0 THEN
    SELECT tariffa_oraria INTO v_tariffa FROM profili WHERE id = NEW.profilo_id;
    IF v_tariffa IS NOT NULL AND v_tariffa > 0 THEN
      NEW.importo := ROUND(v_tariffa * NEW.durata_minuti / 60.0, 2);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_attivita_importo
  BEFORE INSERT OR UPDATE ON fascicolo_attivita
  FOR EACH ROW EXECUTE FUNCTION auto_calcolo_importo_attivita();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. CONTATORE FASCICOLI PER CLIENTE (denormalizzazione per performance)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE soggetti ADD COLUMN IF NOT EXISTS fascicoli_count INT DEFAULT 0;
ALTER TABLE soggetti ADD COLUMN IF NOT EXISTS fatture_totale NUMERIC DEFAULT 0;
ALTER TABLE soggetti ADD COLUMN IF NOT EXISTS ultimo_contatto TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION update_soggetto_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'fascicolo_parti' THEN
    UPDATE soggetti SET
      fascicoli_count = (SELECT COUNT(DISTINCT fascicolo_id) FROM fascicolo_parti WHERE soggetto_id = COALESCE(NEW.soggetto_id, OLD.soggetto_id)),
      ultimo_contatto = NOW()
    WHERE id = COALESCE(NEW.soggetto_id, OLD.soggetto_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_soggetto_counters
  AFTER INSERT OR UPDATE OR DELETE ON fascicolo_parti
  FOR EACH ROW EXECUTE FUNCTION update_soggetto_counters();
