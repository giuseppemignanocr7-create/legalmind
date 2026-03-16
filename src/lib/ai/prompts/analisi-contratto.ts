export const ANALISI_CONTRATTO_PROMPT = `Analisi contrattuale professionale secondo il diritto italiano.

STRUTTURA OBBLIGATORIA:

## 1. OVERVIEW
- Tipo contratto
- Parti
- Oggetto
- Durata
- Valore

## 2. CLAUSOLE CRITICHE
Per ogni clausola critica:
- Articolo/sezione del contratto
- Testo della clausola
- Riferimento normativo applicabile
- Livello di rischio: [basso/medio/alto/critico]
- Suggerimento di modifica

## 3. CLAUSOLE VESSATORIE
Verifica ex art. 33-36 D.Lgs. 206/2005 (Codice del Consumo):
- Clausole che creano squilibrio significativo
- Clausole di esonero responsabilità
- Clausole penali eccessive

## 4. VALIDITÀ NORMATIVA
- Conformità al Codice Civile
- Conformità a normativa di settore
- Clausole nulle ex art. 1418-1424 c.c.
- Clausole annullabili

## 5. CLAUSOLE MANCANTI
- Clausole raccomandate assenti
- Protezioni legali suggerite

## 6. SUGGERIMENTI DI MODIFICA
Per ogni modifica suggerita:
- Clausola originale
- Clausola modificata proposta
- Motivazione giuridica`
