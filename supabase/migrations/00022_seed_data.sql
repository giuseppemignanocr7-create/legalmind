-- 00022_seed_data.sql
-- Seed data for development/demo purposes only
-- In production, this file should be empty or contain only system-level data

-- System atto templates
INSERT INTO atto_templates (tipo, materia, nome, descrizione, contenuto, variabili, is_sistema) VALUES
('atto_citazione', 'civile', 'Atto di Citazione — Risarcimento Danni', 'Template standard per atto di citazione in materia di risarcimento danni', 
'TRIBUNALE DI {{tribunale}}

ATTO DI CITAZIONE

Il/La Sig./Sig.ra {{attore_nome}}, C.F. {{attore_cf}}, residente in {{attore_indirizzo}}, rappresentato/a e difeso/a dall''Avv. {{avvocato_nome}}, C.F. {{avvocato_cf}}, con studio in {{avvocato_indirizzo}}, giusta procura in calce al presente atto, elettivamente domiciliato/a presso il suddetto studio

CITA

{{convenuto_nome}}, C.F. {{convenuto_cf}}, con sede/residente in {{convenuto_indirizzo}}

a comparire innanzi al Tribunale di {{tribunale}}, all''udienza del {{data_udienza}} ore {{ora_udienza}}, con invito a costituirsi nel termine di legge e con l''avvertimento che la costituzione oltre i termini implica le decadenze di cui agli artt. 38 e 167 c.p.c.

PREMESSO

{{premessa}}

IN FATTO

{{fatto}}

IN DIRITTO

{{diritto}}

CONCLUSIONI

Voglia l''Ill.mo Tribunale adito, contrariis reiectis:
{{conclusioni}}

Con vittoria di spese e competenze di giudizio.

Si producono i seguenti documenti:
{{documenti}}

{{luogo}}, lì {{data}}

Avv. {{avvocato_nome}}',
'{"tribunale": {"label": "Tribunale", "tipo": "text", "required": true}, "attore_nome": {"label": "Nome attore", "tipo": "text", "required": true}, "attore_cf": {"label": "CF attore", "tipo": "text", "required": true}, "attore_indirizzo": {"label": "Indirizzo attore", "tipo": "text", "required": true}, "avvocato_nome": {"label": "Nome avvocato", "tipo": "text", "required": true}, "avvocato_cf": {"label": "CF avvocato", "tipo": "text", "required": true}, "avvocato_indirizzo": {"label": "Indirizzo studio", "tipo": "text", "required": true}, "convenuto_nome": {"label": "Nome convenuto", "tipo": "text", "required": true}, "convenuto_cf": {"label": "CF convenuto", "tipo": "text", "required": true}, "convenuto_indirizzo": {"label": "Indirizzo convenuto", "tipo": "text", "required": true}, "premessa": {"label": "Premessa", "tipo": "textarea", "required": true}, "fatto": {"label": "In fatto", "tipo": "textarea", "required": true}, "diritto": {"label": "In diritto", "tipo": "textarea", "required": true}, "conclusioni": {"label": "Conclusioni", "tipo": "textarea", "required": true}, "documenti": {"label": "Lista documenti", "tipo": "textarea", "required": false}, "data_udienza": {"label": "Data udienza", "tipo": "date", "required": false}, "ora_udienza": {"label": "Ora udienza", "tipo": "text", "required": false}, "luogo": {"label": "Luogo", "tipo": "text", "required": true}, "data": {"label": "Data", "tipo": "date", "required": true}}'::jsonb,
true),

('ricorso', 'tributario', 'Ricorso alla CTP', 'Template per ricorso alla Commissione Tributaria Provinciale',
'COMMISSIONE TRIBUTARIA PROVINCIALE DI {{citta}}

RICORSO

Il/La sottoscritto/a {{ricorrente_nome}}, C.F. {{ricorrente_cf}}, residente/con sede in {{ricorrente_indirizzo}}, rappresentato/a e difeso/a dall''Avv. {{avvocato_nome}}

RICORRE

avverso {{tipo_atto}} n. {{numero_atto}} del {{data_atto}}, notificato in data {{data_notifica}}, emesso da {{ente_emittente}}, relativo a {{tributo}} per l''anno d''imposta {{anno_imposta}}, per un importo complessivo di Euro {{importo}}

IN FATTO

{{fatto}}

IN DIRITTO

{{diritto}}

CONCLUSIONI

Si chiede pertanto che la Commissione Tributaria Provinciale di {{citta}} voglia:
{{conclusioni}}

Con vittoria di spese.

{{luogo}}, lì {{data}}

Avv. {{avvocato_nome}}',
'{"citta": {"label": "Città CTP", "tipo": "text", "required": true}, "ricorrente_nome": {"label": "Nome ricorrente", "tipo": "text", "required": true}, "ricorrente_cf": {"label": "CF ricorrente", "tipo": "text", "required": true}, "ricorrente_indirizzo": {"label": "Indirizzo ricorrente", "tipo": "text", "required": true}, "avvocato_nome": {"label": "Nome avvocato", "tipo": "text", "required": true}, "tipo_atto": {"label": "Tipo atto impugnato", "tipo": "text", "required": true}, "numero_atto": {"label": "Numero atto", "tipo": "text", "required": true}, "data_atto": {"label": "Data atto", "tipo": "date", "required": true}, "data_notifica": {"label": "Data notifica", "tipo": "date", "required": true}, "ente_emittente": {"label": "Ente emittente", "tipo": "text", "required": true}, "tributo": {"label": "Tributo", "tipo": "text", "required": true}, "anno_imposta": {"label": "Anno imposta", "tipo": "number", "required": true}, "importo": {"label": "Importo pretesa", "tipo": "number", "required": true}, "fatto": {"label": "In fatto", "tipo": "textarea", "required": true}, "diritto": {"label": "In diritto", "tipo": "textarea", "required": true}, "conclusioni": {"label": "Conclusioni", "tipo": "textarea", "required": true}, "luogo": {"label": "Luogo", "tipo": "text", "required": true}, "data": {"label": "Data", "tipo": "date", "required": true}}'::jsonb,
true);
