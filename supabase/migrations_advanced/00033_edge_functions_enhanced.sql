-- ============================================================================
-- 00033: ENHANCED EDGE FUNCTIONS SUPPORT TABLES
-- Tabelle di supporto per Edge Functions avanzate: OCR, webhook SdI, export
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. JOB QUEUE per operazioni asincrone (OCR, export, invio SdI)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE job_type AS ENUM (
  'ocr_documento', 'export_pdf', 'export_excel',
  'invio_sdi', 'invio_pec', 'firma_digitale',
  'backup_studio', 'import_csv', 'genera_fattura_xml',
  'analisi_ai', 'refresh_normativa'
);

CREATE TABLE job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  profilo_id UUID REFERENCES profili(id),
  tipo job_type NOT NULL,
  stato job_status NOT NULL DEFAULT 'queued',
  priorita INT DEFAULT 5, -- 1 = massima, 10 = minima
  payload JSONB NOT NULL DEFAULT '{}',
  risultato JSONB,
  errore TEXT,
  tentativi INT DEFAULT 0,
  max_tentativi INT DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "job_select" ON job_queue FOR SELECT USING (studio_id = get_user_studio_id());
CREATE POLICY "job_insert" ON job_queue FOR INSERT WITH CHECK (studio_id = get_user_studio_id());

CREATE INDEX idx_job_queue_pending ON job_queue(stato, priorita ASC, scheduled_at ASC)
  WHERE stato IN ('queued', 'processing');
CREATE INDEX idx_job_queue_studio ON job_queue(studio_id, created_at DESC);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. WEBHOOK LOG per SdI e integrazioni esterne
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studi_legali(id),
  source TEXT NOT NULL, -- 'sdi', 'pec', 'stripe', 'normattiva'
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  headers JSONB,
  status_code INT,
  response JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_unprocessed ON webhook_log(source, processed, created_at ASC)
  WHERE processed = false;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. OCR RESULTS (estratti da documenti scansionati)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE ocr_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID NOT NULL REFERENCES documenti(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  testo_estratto TEXT,
  testo_strutturato JSONB, -- { pages: [{ text, confidence, blocks }] }
  lingua_rilevata TEXT DEFAULT 'it',
  confidence DECIMAL(5,4), -- 0.0000 - 1.0000
  metadata JSONB, -- { engine, version, processing_time_ms }
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ocr_select" ON ocr_results FOR SELECT USING (studio_id = get_user_studio_id());

CREATE INDEX idx_ocr_doc ON ocr_results(documento_id);
CREATE INDEX idx_ocr_search ON ocr_results USING GIN(search_vector);

-- Auto-generate search vector
CREATE OR REPLACE FUNCTION ocr_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('italian', COALESCE(NEW.testo_estratto, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ocr_search
  BEFORE INSERT OR UPDATE ON ocr_results
  FOR EACH ROW EXECUTE FUNCTION ocr_search_update();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. SdI (Sistema di Interscambio) TRACKING TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TYPE sdi_stato AS ENUM (
  'generata', 'firmata', 'inviata', 'consegnata', 'accettata',
  'rifiutata', 'decorrenza_termini', 'impossibilita_recapito', 'errore'
);

CREATE TABLE sdi_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fattura_id UUID NOT NULL REFERENCES fatture(id),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  identificativo_sdi TEXT,
  stato sdi_stato NOT NULL DEFAULT 'generata',
  xml_fattura TEXT, -- FatturaPA XML completo
  xml_firmato TEXT, -- P7M base64
  ricevuta_xml TEXT, -- Ricevuta SdI
  data_invio TIMESTAMPTZ,
  data_consegna TIMESTAMPTZ,
  data_accettazione TIMESTAMPTZ,
  data_rifiuto TIMESTAMPTZ,
  motivo_rifiuto TEXT,
  codice_errore TEXT,
  hash_fattura TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sdi_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sdi_select" ON sdi_tracking FOR SELECT USING (studio_id = get_user_studio_id());
CREATE POLICY "sdi_insert" ON sdi_tracking FOR INSERT WITH CHECK (studio_id = get_user_studio_id());
CREATE POLICY "sdi_update" ON sdi_tracking FOR UPDATE USING (studio_id = get_user_studio_id());

CREATE INDEX idx_sdi_fattura ON sdi_tracking(fattura_id);
CREATE INDEX idx_sdi_stato ON sdi_tracking(studio_id, stato);
CREATE INDEX idx_sdi_id ON sdi_tracking(identificativo_sdi) WHERE identificativo_sdi IS NOT NULL;

-- Auto-sync fattura status with SdI
CREATE OR REPLACE FUNCTION sync_sdi_to_fattura()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stato IS DISTINCT FROM NEW.stato THEN
    UPDATE fatture SET
      stato = CASE NEW.stato
        WHEN 'inviata' THEN 'inviata_sdi'
        WHEN 'consegnata' THEN 'consegnata'
        WHEN 'accettata' THEN 'accettata'
        WHEN 'rifiutata' THEN 'rifiutata_sdi'
        ELSE fatture.stato
      END,
      updated_at = NOW()
    WHERE id = NEW.fattura_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sdi_sync
  AFTER UPDATE ON sdi_tracking
  FOR EACH ROW EXECUTE FUNCTION sync_sdi_to_fattura();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. CONSERVAZIONE DIGITALE (CAD compliance)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE conservazione_digitale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  documento_id UUID REFERENCES documenti(id),
  fattura_id UUID REFERENCES fatture(id),
  tipo_documento TEXT NOT NULL, -- 'fattura_attiva', 'fattura_passiva', 'registro', 'atto'
  anno_fiscale INT NOT NULL,
  hash_originale TEXT NOT NULL,
  hash_algoritmo TEXT DEFAULT 'SHA-256',
  marca_temporale TEXT, -- TSA token
  firma_conservazione TEXT, -- firma del responsabile conservazione
  storage_path TEXT NOT NULL,
  volume TEXT, -- volume/lotto di conservazione
  indice_pacchetto JSONB, -- PdV/PdA/PdD metadata
  stato TEXT DEFAULT 'in_attesa', -- 'in_attesa', 'conservato', 'verificato', 'errore'
  data_conservazione TIMESTAMPTZ,
  data_verifica TIMESTAMPTZ,
  scadenza_conservazione DATE, -- 10 anni per fatture fiscali
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conservazione_digitale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conservazione_select" ON conservazione_digitale FOR SELECT
  USING (studio_id = get_user_studio_id());

CREATE INDEX idx_conservazione_studio ON conservazione_digitale(studio_id, anno_fiscale, tipo_documento);
CREATE INDEX idx_conservazione_stato ON conservazione_digitale(stato) WHERE stato != 'conservato';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. TEMPLATE ATTI (modelli per generazione documenti)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE template_atti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studi_legali(id), -- NULL = template di sistema
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL, -- 'citazione', 'comparsa', 'memoria', 'ricorso', 'contratto', 'parere'
  materia TEXT, -- 'civile', 'penale', 'lavoro', etc.
  contenuto_html TEXT NOT NULL,
  variabili JSONB DEFAULT '[]', -- [{name, label, type, required, default}]
  is_system BOOLEAN DEFAULT false,
  usato_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE template_atti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "template_select" ON template_atti FOR SELECT
  USING (is_system = true OR studio_id = get_user_studio_id());
CREATE POLICY "template_insert" ON template_atti FOR INSERT
  WITH CHECK (studio_id = get_user_studio_id());
CREATE POLICY "template_update" ON template_atti FOR UPDATE
  USING (studio_id = get_user_studio_id() AND NOT is_system);

CREATE INDEX idx_template_studio ON template_atti(studio_id, categoria, materia);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. API RATE LIMITING
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studi_legali(id),
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT DEFAULT 1,
  UNIQUE(studio_id, endpoint, window_start)
);

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_studio_id UUID,
  p_endpoint TEXT,
  p_max_requests INT DEFAULT 100,
  p_window_minutes INT DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
  v_window TIMESTAMPTZ;
BEGIN
  v_window := DATE_TRUNC('minute', NOW()) - ((EXTRACT(MINUTE FROM NOW())::INT % p_window_minutes) || ' minutes')::INTERVAL;
  
  INSERT INTO api_rate_limits (studio_id, endpoint, window_start, request_count)
  VALUES (p_studio_id, p_endpoint, v_window, 1)
  ON CONFLICT (studio_id, endpoint, window_start) 
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;
  
  RETURN v_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old rate limit entries
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS VOID AS $$
BEGIN
  DELETE FROM api_rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
