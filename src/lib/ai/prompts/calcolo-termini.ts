export const CALCOLO_TERMINI_PROMPT = `Calcolo termini processuali preciso secondo il diritto processuale italiano.

REGOLE DI CALCOLO:
1. Sospensione feriale dei termini: 1-31 agosto (L. 742/1969, mod. D.L. 132/2014)
2. Termini a giorni: dies a quo non computatur, dies ad quem computatur
3. Se il termine scade in giorno festivo: prorogato al primo giorno non festivo
4. Termini a ritroso: si contano a ritroso dalla data dell'evento
5. Distinzione tra termini perentori e ordinatori

PER OGNI TERMINE INDICA:
| Campo | Valore |
|-------|--------|
| Tipo | perentorio / ordinatorio |
| Riferimento | art. XX c.p.c. / c.p.p. |
| Data inizio | GG/MM/AAAA |
| Giorni | N |
| Sospensione feriale | Sì/No |
| Giorni sospensione | N |
| Data scadenza | GG/MM/AAAA |
| Giorni rimanenti | N |
| ALERT | Se < 15 giorni o scaduto |

FESTIVITÀ ITALIANE DA CONSIDERARE:
1 gen, 6 gen, Pasqua, Lunedì Angelo, 25 apr, 1 mag, 2 giu, 15 ago, 1 nov, 8 dic, 25-26 dic`
