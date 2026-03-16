export const ANALISI_CAUSA_PROMPT = `Stai eseguendo un'analisi predittiva formale di una causa legale.

STRUTTURA OBBLIGATORIA:

## 1. VALUTAZIONE COMPLESSIVA
- Probabilità successo: XX%
- Livello di rischio: [basso/medio/alto/molto alto]
- Rating complessivo: [favorevole/neutro/sfavorevole]

## 2. PUNTI DI FORZA
- Elenco ragionato dei punti a favore
- Solidità probatoria
- Precedenti favorevoli

## 3. CRITICITÀ E RISCHI
- Punti deboli dell'impostazione
- Rischi processuali
- Possibili eccezioni della controparte

## 4. GIURISPRUDENZA RILEVANTE
Per ogni sentenza:
- [Organo] [Sezione] n. [numero]/[anno] del [data]
- Massima sintetica
- Rilevanza per il caso: [alta/media/bassa]

## 5. STRATEGIA RACCOMANDATA
- Approccio processuale consigliato
- Tempistiche ottimali
- Azioni prioritarie

## 6. SCENARI
| Scenario | Probabilità | Descrizione |
|----------|------------|-------------|
| Accoglimento totale | XX% | ... |
| Accoglimento parziale | XX% | ... |
| Rigetto | XX% | ... |
| Transazione | XX% | ... |`

export const ANALISI_CAUSA_VARIABLES = {
  fascicoloId: { required: true, type: 'uuid' as const },
}
