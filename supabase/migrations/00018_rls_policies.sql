-- 00018_rls_policies.sql

ALTER TABLE studi_legali ENABLE ROW LEVEL SECURITY;
ALTER TABLE profili ENABLE ROW LEVEL SECURITY;
ALTER TABLE soggetti ENABLE ROW LEVEL SECURITY;
ALTER TABLE fascicoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE fascicolo_parti ENABLE ROW LEVEL SECURITY;
ALTER TABLE fascicolo_eventi ENABLE ROW LEVEL SECURITY;
ALTER TABLE fascicolo_attivita ENABLE ROW LEVEL SECURITY;
ALTER TABLE documenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE atti ENABLE ROW LEVEL SECURITY;
ALTER TABLE scadenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE udienze ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatture ENABLE ROW LEVEL SECURITY;
ALTER TABLE fattura_voci ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE normativa_alert ENABLE ROW LEVEL SECURITY;
ALTER TABLE normativa_user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messaggi ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION get_user_studio_id()
RETURNS UUID AS $$
  SELECT studio_id FROM profili WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Studio isolation policies
CREATE POLICY "Studio isolation" ON fascicoli
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON soggetti
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON atti
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON scadenze
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON udienze
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON fatture
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON documenti
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON profili
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON normativa_alert
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON ai_conversazioni
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON ai_usage
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON audit_log
  FOR ALL USING (studio_id = get_user_studio_id());

CREATE POLICY "Studio isolation" ON pagamenti
  FOR ALL USING (studio_id = get_user_studio_id());

-- Normativa feed: public read
CREATE POLICY "Public read" ON normativa_feed
  FOR SELECT USING (true);
