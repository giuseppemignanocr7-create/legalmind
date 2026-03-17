-- Full-text search with pg_trgm and tsvector
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add search vectors to fascicoli
ALTER TABLE fascicoli ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION fascicoli_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('italian', coalesce(NEW.numero_interno, '')), 'A') ||
    setweight(to_tsvector('italian', coalesce(NEW.oggetto, '')), 'A') ||
    setweight(to_tsvector('italian', coalesce(NEW.descrizione, '')), 'B') ||
    setweight(to_tsvector('italian', coalesce(NEW.autorita_giudiziaria, '')), 'C') ||
    setweight(to_tsvector('italian', coalesce(NEW.numero_rg, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fascicoli_search_trigger ON fascicoli;
CREATE TRIGGER fascicoli_search_trigger
  BEFORE INSERT OR UPDATE ON fascicoli
  FOR EACH ROW EXECUTE FUNCTION fascicoli_search_update();

CREATE INDEX IF NOT EXISTS idx_fascicoli_search ON fascicoli USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_fascicoli_oggetto_trgm ON fascicoli USING gin(oggetto gin_trgm_ops);

-- Add search vectors to clienti
ALTER TABLE clienti ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION clienti_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('italian', coalesce(NEW.display_name, '')), 'A') ||
    setweight(to_tsvector('italian', coalesce(NEW.codice_fiscale, '')), 'B') ||
    setweight(to_tsvector('italian', coalesce(NEW.partita_iva, '')), 'B') ||
    setweight(to_tsvector('italian', coalesce(NEW.email, '')), 'C') ||
    setweight(to_tsvector('italian', coalesce(NEW.pec, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clienti_search_trigger ON clienti;
CREATE TRIGGER clienti_search_trigger
  BEFORE INSERT OR UPDATE ON clienti
  FOR EACH ROW EXECUTE FUNCTION clienti_search_update();

CREATE INDEX IF NOT EXISTS idx_clienti_search ON clienti USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_clienti_display_name_trgm ON clienti USING gin(display_name gin_trgm_ops);

-- Add search vectors to atti
ALTER TABLE atti ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION atti_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('italian', coalesce(NEW.titolo, '')), 'A') ||
    setweight(to_tsvector('italian', coalesce(NEW.contenuto_text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS atti_search_trigger ON atti;
CREATE TRIGGER atti_search_trigger
  BEFORE INSERT OR UPDATE ON atti
  FOR EACH ROW EXECUTE FUNCTION atti_search_update();

CREATE INDEX IF NOT EXISTS idx_atti_search ON atti USING gin(search_vector);

-- Global search function
CREATE OR REPLACE FUNCTION global_search(query_text text, result_limit int DEFAULT 20)
RETURNS TABLE(
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 'fascicolo'::text, f.id, f.oggetto, f.numero_interno, ts_rank(f.search_vector, websearch_to_tsquery('italian', query_text))
    FROM fascicoli f
    WHERE f.search_vector @@ websearch_to_tsquery('italian', query_text)
       OR f.oggetto % query_text
    ORDER BY ts_rank(f.search_vector, websearch_to_tsquery('italian', query_text)) DESC
    LIMIT result_limit
  )
  UNION ALL
  (
    SELECT 'cliente'::text, c.id, c.display_name, c.codice_fiscale, ts_rank(c.search_vector, websearch_to_tsquery('italian', query_text))
    FROM clienti c
    WHERE c.search_vector @@ websearch_to_tsquery('italian', query_text)
       OR c.display_name % query_text
    ORDER BY ts_rank(c.search_vector, websearch_to_tsquery('italian', query_text)) DESC
    LIMIT result_limit
  )
  UNION ALL
  (
    SELECT 'atto'::text, a.id, a.titolo, NULL, ts_rank(a.search_vector, websearch_to_tsquery('italian', query_text))
    FROM atti a
    WHERE a.search_vector @@ websearch_to_tsquery('italian', query_text)
    ORDER BY ts_rank(a.search_vector, websearch_to_tsquery('italian', query_text)) DESC
    LIMIT result_limit
  )
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
