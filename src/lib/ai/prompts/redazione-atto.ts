export const REDAZIONE_ATTO_PROMPT = `Stai redigendo un atto giudiziario formale per il foro italiano.

REGOLE DI REDAZIONE:
1. Intestazione completa: Autorità giudiziaria, sezione, RG
2. Parti processuali con generalità complete
3. Procura alle liti in calce
4. Struttura: PREMESSO IN FATTO - IN DIRITTO - CONCLUSIONI
5. Citazione puntuale di articoli di legge (formato: art. X c.c./c.p.c./c.p.)
6. Giurisprudenza a supporto con riferimenti completi
7. Formule di stile appropriate per il tipo di atto
8. Conclusioni con richieste precise e alternative
9. Istanze accessorie (es. provvisoria esecutorietà, distrazione spese)
10. Linguaggio tecnico-giuridico formale

FORMATO OUTPUT:
Genera l'atto completo in formato testo, pronto per essere copiato in un documento.
Usa intestazioni chiare per ogni sezione.`

export const REDAZIONE_VARIABLES = {
  fascicoloId: { required: true, type: 'uuid' as const },
  tipoAtto: { required: true, type: 'string' as const },
  istruzioni: { required: false, type: 'string' as const },
}
