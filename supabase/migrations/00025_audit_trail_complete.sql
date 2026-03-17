-- ============================================================================
-- 00025: COMPLETE AUDIT TRAIL SYSTEM
-- Trigger automatici su TUTTE le tabelle con snapshot JSON + metadata
-- ============================================================================

-- Enhanced audit log columns
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS query_text TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS execution_time_ms INT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS app_version TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info';

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
  v_studio_id UUID;
  v_old JSONB;
  v_new JSONB;
  v_changed_fields TEXT[];
  v_col TEXT;
BEGIN
  -- Extract studio_id from the row
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_studio_id := (v_old->>'studio_id')::UUID;
  ELSE
    v_new := to_jsonb(NEW);
    v_studio_id := (v_new->>'studio_id')::UUID;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    -- Track only changed fields for efficiency
    FOR v_col IN SELECT key FROM jsonb_each(v_new) 
      WHERE v_new->key IS DISTINCT FROM v_old->key
    LOOP
      v_changed_fields := array_append(v_changed_fields, v_col);
    END LOOP;
    
    -- Skip if nothing actually changed
    IF v_changed_fields IS NULL OR array_length(v_changed_fields, 1) IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO audit_log (
    studio_id, profilo_id, azione, entita, entita_id,
    dati_precedenti, dati_nuovi, severity
  ) VALUES (
    COALESCE(v_studio_id, '00000000-0000-0000-0000-000000000000'::UUID),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN (v_old->>'id')::UUID
      ELSE (v_new->>'id')::UUID
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN v_old ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN v_new ELSE NULL END,
    CASE 
      WHEN TG_OP = 'DELETE' THEN 'warning'
      WHEN TG_TABLE_NAME IN ('fatture', 'pagamenti') THEN 'important'
      ELSE 'info'
    END
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to ALL critical tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN VALUES 
    ('fascicoli'), ('soggetti'), ('atti'), ('documenti'),
    ('scadenze'), ('udienze'), ('fatture'), ('fattura_voci'),
    ('pagamenti'), ('fascicolo_parti'), ('fascicolo_eventi'),
    ('fascicolo_attivita'), ('profili'), ('studi_legali'),
    ('ai_conversazioni'), ('normativa_alert')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%s ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_audit_%s AFTER INSERT OR UPDATE OR DELETE ON %I 
       FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn()',
      t, t
    );
  END LOOP;
END;
$$;

-- Audit log retention: auto-cleanup function
CREATE OR REPLACE FUNCTION cleanup_audit_log(p_retention_days INT DEFAULT 365)
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM audit_log 
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL
    AND severity != 'important';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit statistics view
CREATE OR REPLACE VIEW v_audit_statistics AS
SELECT 
  studio_id,
  DATE_TRUNC('day', created_at) AS giorno,
  entita,
  azione,
  COUNT(*) AS conteggio,
  COUNT(DISTINCT profilo_id) AS utenti_distinti
FROM audit_log
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY studio_id, DATE_TRUNC('day', created_at), entita, azione
ORDER BY giorno DESC;

-- User activity timeline
CREATE OR REPLACE VIEW v_user_activity AS
SELECT 
  al.profilo_id,
  p.nome || ' ' || p.cognome AS utente,
  al.azione,
  al.entita,
  al.entita_id,
  al.created_at,
  al.severity,
  CASE al.entita
    WHEN 'fascicoli' THEN (al.dati_nuovi->>'oggetto')
    WHEN 'atti' THEN (al.dati_nuovi->>'titolo')
    WHEN 'fatture' THEN (al.dati_nuovi->>'numero')
    WHEN 'scadenze' THEN (al.dati_nuovi->>'titolo')
    WHEN 'soggetti' THEN (al.dati_nuovi->>'display_name')
    ELSE NULL
  END AS descrizione_entita
FROM audit_log al
LEFT JOIN profili p ON p.id = al.profilo_id
ORDER BY al.created_at DESC;
