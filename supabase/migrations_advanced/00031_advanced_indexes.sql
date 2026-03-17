-- ============================================================================
-- 00031: ADVANCED INDEXES — Performance Estrema
-- BRIN, GiST, partial, covering, expression indexes per query < 10ms
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. BRIN INDEXES (per tabelle con dati time-series — audit, statistiche)
-- Compatti ed efficienti per range queries su colonne monotonamente crescenti
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE INDEX IF NOT EXISTS idx_audit_log_brin ON audit_log USING BRIN(created_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_stats_giornaliere_brin ON studio_statistiche_giornaliere USING BRIN(data) WITH (pages_per_range = 16);
CREATE INDEX IF NOT EXISTS idx_notifiche_brin ON notifiche_inapp USING BRIN(created_at) WITH (pages_per_range = 32);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. PARTIAL INDEXES (condizionali — scansionano solo subset)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Solo fascicoli attivi con priorità alta/urgente
CREATE INDEX IF NOT EXISTS idx_fascicoli_urgenti ON fascicoli(studio_id, priorita, data_apertura DESC)
  WHERE stato IN ('aperto', 'in_corso') AND priorita IN ('alta', 'urgente');

-- Solo scadenze critiche non completate
CREATE INDEX IF NOT EXISTS idx_scadenze_critiche ON scadenze(studio_id, data_scadenza ASC)
  WHERE stato = 'attiva' AND urgenza IN ('critica', 'alta');

-- Solo fatture non pagate con importo > 0
CREATE INDEX IF NOT EXISTS idx_fatture_aperte ON fatture(studio_id, data_scadenza_pagamento ASC)
  WHERE stato NOT IN ('pagata', 'annullata', 'nota_credito') AND totale_dovuto > 0;

-- Solo atti in bozza (per editor)
CREATE INDEX IF NOT EXISTS idx_atti_bozza ON atti(studio_id, fascicolo_id, updated_at DESC)
  WHERE stato = 'bozza';

-- Solo documenti non firmati (per workflow firma)
CREATE INDEX IF NOT EXISTS idx_doc_da_firmare ON documenti(studio_id, fascicolo_id)
  WHERE firmato = false AND tipo_file = 'application/pdf';

-- Solo profili attivi (per select/autocomplete)
CREATE INDEX IF NOT EXISTS idx_profili_attivi ON profili(studio_id, cognome, nome)
  WHERE is_active = true;

-- Notifiche non lette per utente
CREATE INDEX IF NOT EXISTS idx_notifiche_non_lette ON notifiche_inapp(destinatario_id, created_at DESC)
  WHERE letta = false;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. EXPRESSION INDEXES (su campi calcolati/trasformati)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Case-insensitive search su nome cliente
CREATE INDEX IF NOT EXISTS idx_soggetti_nome_lower ON soggetti(studio_id, LOWER(display_name));

-- Anno + mese fattura per report
CREATE INDEX IF NOT EXISTS idx_fatture_anno_mese ON fatture(studio_id, (EXTRACT(YEAR FROM data_emissione)::INT), (EXTRACT(MONTH FROM data_emissione)::INT));

-- Anno fascicolo per numerazione
CREATE INDEX IF NOT EXISTS idx_fascicoli_anno ON fascicoli(studio_id, (EXTRACT(YEAR FROM data_apertura)::INT));

-- JSONB path per settings studio
CREATE INDEX IF NOT EXISTS idx_studio_settings ON studi_legali USING GIN(settings jsonb_path_ops);

-- JSONB path per preferences profilo
CREATE INDEX IF NOT EXISTS idx_profili_prefs ON profili USING GIN(preferences jsonb_path_ops);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. COVERING INDEXES (include colonne per index-only scans)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Fascicoli lista: tutto ciò che serve per la lista senza toccare la tabella
CREATE INDEX IF NOT EXISTS idx_fascicoli_lista ON fascicoli(studio_id, stato, data_apertura DESC)
  INCLUDE (numero_interno, oggetto, materia, priorita, avvocato_responsabile, valore_causa);

-- Scadenze widget: covering per il widget dashboard
CREATE INDEX IF NOT EXISTS idx_scadenze_widget ON scadenze(studio_id, stato, data_scadenza ASC)
  INCLUDE (titolo, tipo, urgenza, assegnato_a, fascicolo_id);

-- Fatture lista: covering
CREATE INDEX IF NOT EXISTS idx_fatture_lista ON fatture(studio_id, stato, data_emissione DESC)
  INCLUDE (numero, cliente_id, totale_dovuto, data_scadenza_pagamento);

-- Udienze prossime: covering
CREATE INDEX IF NOT EXISTS idx_udienze_prossime ON udienze(studio_id, data_udienza ASC)
  INCLUDE (tipo, autorita, aula, giudice, fascicolo_id, avvocato_presente);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. COMPOSITE MULTI-COLUMN INDEXES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Attività per fascicolo + mese (time tracking)
CREATE INDEX IF NOT EXISTS idx_attivita_fascicolo_mese ON fascicolo_attivita(fascicolo_id, data DESC, profilo_id);

-- Fascicolo parti per conflict check
CREATE INDEX IF NOT EXISTS idx_parti_soggetto ON fascicolo_parti(soggetto_id, ruolo, fascicolo_id);

-- Documenti per fascicolo ordinati
CREATE INDEX IF NOT EXISTS idx_doc_fascicolo ON documenti(fascicolo_id, categoria, created_at DESC);

-- AI messaggi per conversazione
CREATE INDEX IF NOT EXISTS idx_ai_msg ON ai_messaggi(conversazione_id, created_at ASC);

-- Pagamenti per fattura
CREATE INDEX IF NOT EXISTS idx_pagamenti_fattura ON pagamenti(fattura_id, data_pagamento DESC);

-- Fatture per cliente
CREATE INDEX IF NOT EXISTS idx_fatture_cliente ON fatture(cliente_id, data_emissione DESC);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. GIN INDEXES per array e full-text
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Specializzazioni avvocato (array search)
CREATE INDEX IF NOT EXISTS idx_profili_spec ON profili USING GIN(specializzazioni);

-- Tags fascicolo (se presenti)
-- CREATE INDEX IF NOT EXISTS idx_fascicoli_tags ON fascicoli USING GIN(tags);

-- Audit log dati JSONB per query analitiche
CREATE INDEX IF NOT EXISTS idx_audit_dati_nuovi ON audit_log USING GIN(dati_nuovi jsonb_path_ops)
  WHERE dati_nuovi IS NOT NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. ANALYZE per statistiche aggiornate
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYZE fascicoli;
ANALYZE soggetti;
ANALYZE atti;
ANALYZE scadenze;
ANALYZE udienze;
ANALYZE fatture;
ANALYZE fattura_voci;
ANALYZE pagamenti;
ANALYZE documenti;
ANALYZE audit_log;
ANALYZE profili;
ANALYZE fascicolo_parti;
ANALYZE fascicolo_attivita;
ANALYZE fascicolo_eventi;
