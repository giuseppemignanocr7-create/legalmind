-- 00020_triggers.sql

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_studi_updated_at BEFORE UPDATE ON studi_legali FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profili_updated_at BEFORE UPDATE ON profili FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_soggetti_updated_at BEFORE UPDATE ON soggetti FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fascicoli_updated_at BEFORE UPDATE ON fascicoli FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_atti_updated_at BEFORE UPDATE ON atti FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fatture_updated_at BEFORE UPDATE ON fatture FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_scadenze_updated_at BEFORE UPDATE ON scadenze FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_udienze_updated_at BEFORE UPDATE ON udienze FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger ricalcolo fattura su insert/update/delete voci
CREATE TRIGGER trg_fattura_voci_calc
  AFTER INSERT OR UPDATE OR DELETE ON fattura_voci
  FOR EACH ROW EXECUTE FUNCTION calcola_totale_fattura();

-- Auto-genera scadenze da udienze
CREATE OR REPLACE FUNCTION auto_scadenza_udienza()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO scadenze (
    studio_id, fascicolo_id, tipo, titolo, descrizione,
    data_scadenza, ora_scadenza, urgenza, assegnato_a,
    alert_email, alert_push
  ) VALUES (
    NEW.studio_id, NEW.fascicolo_id, 'udienza',
    'Udienza: ' || NEW.tipo || ' - ' || NEW.autorita,
    'Udienza ' || NEW.tipo || ' presso ' || NEW.autorita || COALESCE(' Aula ' || NEW.aula, ''),
    NEW.data_udienza::DATE, NEW.data_udienza::TIME,
    'alta', NEW.avvocato_presente,
    true, true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_udienza_scadenza
  AFTER INSERT ON udienze
  FOR EACH ROW EXECUTE FUNCTION auto_scadenza_udienza();
