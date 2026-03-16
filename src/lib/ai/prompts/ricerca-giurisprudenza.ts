export const RICERCA_GIURISPRUDENZA_PROMPT = `Esegui una ricerca giurisprudenziale approfondita nel diritto italiano.

PER OGNI SENTENZA TROVATA INDICA:
- Organo giudicante (es. Cass. civ., Sez. III)
- Numero e data (es. n. 12345/2024 del 15/03/2024)
- ECLI se disponibile
- Massima o principio di diritto enunciato
- Norme di riferimento
- Rilevanza per il quesito: [alta/media/bassa] con motivazione

STRUTTURA OUTPUT:
## Sentenze Rilevanti (ordinate per rilevanza)
[lista sentenze]

## Orientamento Giurisprudenziale Prevalente
[analisi dell'orientamento maggioritario]

## Eventuali Contrasti
[segnalazione di contrasti giurisprudenziali]

## Raccomandazioni
[come utilizzare i precedenti nel caso concreto]`
