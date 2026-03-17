-- ============================================================================
-- 00034: SEED DATA PROFESSIONALE — Demo Completo Studio Legale
-- Dati realistici per demo: studio, avvocati, clienti, fascicoli, fatture
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. STUDIO LEGALE DEMO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO studi_legali (id, nome, tipo, partita_iva, codice_fiscale, indirizzo_sede, cap, citta, provincia, regione, telefono, email, pec, sito_web, codice_destinatario_sdi, foro_competente, ordine_appartenenza, subscription, max_users, max_fascicoli, max_storage_gb)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Studio Legale Associato Rossi & Partners',
  'associato',
  '12345678901',
  'RSSMRA80A01H501Z',
  'Via dei Fori Imperiali, 42',
  '00186',
  'Roma',
  'RM',
  'Lazio',
  '+39 06 1234567',
  'info@rossipartners.it',
  'studio.rossi@pec.avvocati.it',
  'https://www.rossipartners.it',
  'SUBM70N',
  'Tribunale di Roma',
  'Ordine degli Avvocati di Roma',
  'enterprise',
  20,
  5000,
  100
) ON CONFLICT (id) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. TEMPLATE ATTI DI SISTEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO template_atti (studio_id, nome, categoria, materia, contenuto_html, variabili, is_system) VALUES
(NULL, 'Atto di Citazione', 'citazione', 'civile',
'<h1>ATTO DI CITAZIONE</h1>
<p>Il/La Sig./Sig.ra <strong>{{attore_nome}}</strong>, C.F. {{attore_cf}}, residente in {{attore_indirizzo}}, elettivamente domiciliato/a in {{domicilio_eletto}} presso lo studio dell''Avv. {{avvocato_nome}}, che lo/la rappresenta e difende in virtù di procura in calce/margine al presente atto,</p>
<h2>CITA</h2>
<p>Il/La Sig./Sig.ra <strong>{{convenuto_nome}}</strong>, C.F. {{convenuto_cf}}, residente in {{convenuto_indirizzo}},</p>
<p>a comparire innanzi al {{autorita}} nella persona del Giudice designando, all''udienza del {{data_udienza}} ore {{ora_udienza}}, con l''invito a costituirsi nel termine di legge e con l''avvertimento che la costituzione oltre i termini di legge implica le decadenze di cui agli artt. 38, 167 e 171 c.p.c.</p>
<h2>PREMESSO IN FATTO</h2>
<p>{{premessa_fatto}}</p>
<h2>IN DIRITTO</h2>
<p>{{motivazione_diritto}}</p>
<h2>CONCLUSIONI</h2>
<p>Voglia l''Ill.mo Tribunale adìto, disattesa ogni contraria istanza, eccezione e deduzione:</p>
<p>{{conclusioni}}</p>
<p>Con vittoria di spese e competenze di giudizio.</p>
<p>Si producono i seguenti documenti: {{documenti}}</p>
<p>Si indicano a prova i seguenti testimoni: {{testimoni}}</p>
<p>{{luogo}}, lì {{data}}</p>
<p>Avv. {{avvocato_nome}}</p>',
'[{"name":"attore_nome","label":"Nome Attore","type":"text","required":true},
{"name":"attore_cf","label":"CF Attore","type":"text","required":true},
{"name":"attore_indirizzo","label":"Indirizzo Attore","type":"text","required":true},
{"name":"convenuto_nome","label":"Nome Convenuto","type":"text","required":true},
{"name":"convenuto_cf","label":"CF Convenuto","type":"text","required":true},
{"name":"convenuto_indirizzo","label":"Indirizzo Convenuto","type":"text","required":true},
{"name":"avvocato_nome","label":"Avvocato","type":"text","required":true},
{"name":"domicilio_eletto","label":"Domicilio Eletto","type":"text","required":true},
{"name":"autorita","label":"Autorità Giudiziaria","type":"text","required":true},
{"name":"data_udienza","label":"Data Udienza","type":"date","required":true},
{"name":"premessa_fatto","label":"Premessa in Fatto","type":"richtext","required":true},
{"name":"motivazione_diritto","label":"Motivazione in Diritto","type":"richtext","required":true},
{"name":"conclusioni","label":"Conclusioni","type":"richtext","required":true}]'::JSONB,
true),

(NULL, 'Comparsa di Costituzione e Risposta', 'comparsa', 'civile',
'<h1>COMPARSA DI COSTITUZIONE E RISPOSTA</h1>
<p>Il/La Sig./Sig.ra <strong>{{convenuto_nome}}</strong>, C.F. {{convenuto_cf}}, residente in {{convenuto_indirizzo}}, elettivamente domiciliato/a in {{domicilio_eletto}} presso lo studio dell''Avv. {{avvocato_nome}}, che lo/la rappresenta e difende come da procura in calce,</p>
<h2>SI COSTITUISCE</h2>
<p>nel giudizio promosso con atto di citazione notificato in data {{data_notifica}} dal/dalla Sig./Sig.ra {{attore_nome}} (R.G. n. {{numero_rg}}), pendente innanzi al {{autorita}},</p>
<h2>IN FATTO</h2>
<p>{{esposizione_fatto}}</p>
<h2>IN DIRITTO</h2>
<p>{{motivazione_diritto}}</p>
<h2>CONCLUSIONI</h2>
<p>Voglia l''Ill.mo Tribunale adìto, in via preliminare e/o di merito:</p>
<p>{{conclusioni}}</p>
<p>Con vittoria di spese e competenze di giudizio.</p>',
'[{"name":"convenuto_nome","label":"Nome Convenuto","type":"text","required":true},
{"name":"attore_nome","label":"Nome Attore","type":"text","required":true},
{"name":"numero_rg","label":"Numero RG","type":"text","required":true},
{"name":"autorita","label":"Autorità Giudiziaria","type":"text","required":true},
{"name":"avvocato_nome","label":"Avvocato","type":"text","required":true},
{"name":"esposizione_fatto","label":"Esposizione in Fatto","type":"richtext","required":true},
{"name":"motivazione_diritto","label":"Motivazione in Diritto","type":"richtext","required":true},
{"name":"conclusioni","label":"Conclusioni","type":"richtext","required":true}]'::JSONB,
true),

(NULL, 'Ricorso per Decreto Ingiuntivo', 'ricorso', 'civile',
'<h1>RICORSO PER DECRETO INGIUNTIVO</h1>
<p>art. 633 e ss. c.p.c.</p>
<p>Il/La Sig./Sig.ra <strong>{{ricorrente_nome}}</strong>, C.F. {{ricorrente_cf}}, rappresentato/a e difeso/a dall''Avv. {{avvocato_nome}},</p>
<h2>ESPONE</h2>
<p>{{esposizione}}</p>
<h2>CHIEDE</h2>
<p>che l''Ill.mo Giudice adìto voglia ingiungere a {{debitore_nome}}, C.F. {{debitore_cf}}, il pagamento della somma di € {{importo}} oltre interessi legali dal {{data_decorrenza}} al saldo effettivo, nonché le spese e competenze del presente procedimento.</p>
<p>Si chiede la concessione della provvisoria esecutività ex art. {{articolo_esecutivita}} c.p.c.</p>',
'[{"name":"ricorrente_nome","label":"Ricorrente","type":"text","required":true},
{"name":"debitore_nome","label":"Debitore","type":"text","required":true},
{"name":"importo","label":"Importo €","type":"number","required":true},
{"name":"avvocato_nome","label":"Avvocato","type":"text","required":true}]'::JSONB,
true),

(NULL, 'Parere Pro Veritate', 'parere', NULL,
'<h1>PARERE PRO VERITATE</h1>
<p><strong>Committente:</strong> {{committente}}</p>
<p><strong>Oggetto:</strong> {{oggetto}}</p>
<p><strong>Data:</strong> {{data}}</p>
<h2>1. QUESITO</h2>
<p>{{quesito}}</p>
<h2>2. PREMESSA IN FATTO</h2>
<p>{{premessa_fatto}}</p>
<h2>3. ANALISI GIURIDICA</h2>
<p>{{analisi}}</p>
<h2>4. GIURISPRUDENZA DI RIFERIMENTO</h2>
<p>{{giurisprudenza}}</p>
<h2>5. CONCLUSIONI</h2>
<p>{{conclusioni}}</p>
<p>Tanto si espone pro veritate.</p>
<p>{{luogo}}, lì {{data}}</p>
<p>Avv. {{avvocato_nome}}</p>',
'[{"name":"committente","label":"Committente","type":"text","required":true},
{"name":"oggetto","label":"Oggetto","type":"text","required":true},
{"name":"quesito","label":"Quesito","type":"richtext","required":true},
{"name":"analisi","label":"Analisi Giuridica","type":"richtext","required":true},
{"name":"conclusioni","label":"Conclusioni","type":"richtext","required":true},
{"name":"avvocato_nome","label":"Avvocato","type":"text","required":true}]'::JSONB,
true),

(NULL, 'Memoria ex art. 183 co. 6 c.p.c.', 'memoria', 'civile',
'<h1>MEMORIA EX ART. 183 CO. 6 N. {{numero_memoria}} C.P.C.</h1>
<p>Nell''interesse del/della Sig./Sig.ra {{parte_nome}}, rappresentato/a e difeso/a dall''Avv. {{avvocato_nome}}, nel giudizio R.G. n. {{numero_rg}} pendente innanzi al {{autorita}}, Giudice {{giudice}},</p>
<p>contro {{controparte_nome}}, rappresentato/a dall''Avv. {{avvocato_controparte}},</p>
<h2>IN FATTO E IN DIRITTO</h2>
<p>{{contenuto}}</p>
<h2>ISTANZE ISTRUTTORIE</h2>
<p>{{istanze}}</p>
<p>{{luogo}}, lì {{data}}</p>
<p>Avv. {{avvocato_nome}}</p>',
'[{"name":"numero_memoria","label":"Numero Memoria (1/2/3)","type":"select","required":true,"options":["1","2","3"]},
{"name":"parte_nome","label":"Parte Assistita","type":"text","required":true},
{"name":"controparte_nome","label":"Controparte","type":"text","required":true},
{"name":"numero_rg","label":"Numero RG","type":"text","required":true},
{"name":"avvocato_nome","label":"Avvocato","type":"text","required":true},
{"name":"contenuto","label":"Contenuto","type":"richtext","required":true},
{"name":"istanze","label":"Istanze Istruttorie","type":"richtext","required":false}]'::JSONB,
true),

(NULL, 'Contratto di Prestazione d''Opera Professionale', 'contratto', NULL,
'<h1>CONTRATTO DI PRESTAZIONE D''OPERA PROFESSIONALE</h1>
<p><strong>TRA</strong></p>
<p>L''Avv. {{avvocato_nome}}, con studio in {{studio_indirizzo}}, P.IVA {{studio_piva}}, iscritto all''Albo degli Avvocati di {{foro}} al n. {{numero_albo}} (di seguito "Professionista")</p>
<p><strong>E</strong></p>
<p>Il/La Sig./Sig.ra {{cliente_nome}}, C.F. {{cliente_cf}}, residente in {{cliente_indirizzo}} (di seguito "Cliente")</p>
<h2>PREMESSO CHE</h2>
<p>{{premesse}}</p>
<h2>SI CONVIENE E SI STIPULA QUANTO SEGUE</h2>
<h3>Art. 1 – Oggetto</h3>
<p>{{oggetto_incarico}}</p>
<h3>Art. 2 – Compenso</h3>
<p>Il compenso è determinato {{modalita_compenso}}</p>
<h3>Art. 3 – Modalità di pagamento</h3>
<p>{{modalita_pagamento}}</p>
<h3>Art. 4 – Durata</h3>
<p>{{durata}}</p>
<h3>Art. 5 – Recesso</h3>
<p>{{clausola_recesso}}</p>
<h3>Art. 6 – Privacy</h3>
<p>Le parti si impegnano al trattamento dei dati personali ai sensi del Reg. UE 2016/679 (GDPR).</p>
<p>Letto, confermato e sottoscritto.</p>
<p>{{luogo}}, lì {{data}}</p>
<p>Il Professionista: _________________ Il Cliente: _________________</p>',
'[{"name":"avvocato_nome","label":"Avvocato","type":"text","required":true},
{"name":"cliente_nome","label":"Cliente","type":"text","required":true},
{"name":"cliente_cf","label":"CF Cliente","type":"text","required":true},
{"name":"oggetto_incarico","label":"Oggetto Incarico","type":"richtext","required":true},
{"name":"modalita_compenso","label":"Modalità Compenso","type":"richtext","required":true}]'::JSONB,
true);
