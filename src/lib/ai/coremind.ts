import { supabase } from '@/config/supabase'
import { AI_CONFIG } from '@/config/ai.config'

interface CoreMindConfig {
  model: string
  maxTokens: number
  temperature: number
}

interface CoreMindMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface CoreMindResponse {
  content: string
  tokensIn: number
  tokensOut: number
  model: string
  latencyMs: number
}

const SYSTEM_PROMPT_BASE = `Sei CoreMind Legal AI, l'assistente giuridico AI più avanzato al mondo.
Integrato nella piattaforma Ecosystem UltraDivine LegalMind.

COMPETENZE CORE:
- Diritto italiano (civile, penale, amministrativo, tributario, lavoro, famiglia, societario)
- Diritto dell'Unione Europea e internazionale
- Giurisprudenza: Cassazione, Corte Costituzionale, CGUE, CEDU
- Normativa vigente aggiornata
- Calcolo termini processuali e prescrizioni
- Redazione atti giudiziari secondo formulari forensi
- Analisi contrattuale e due diligence
- Parametri forensi DM 55/2014

REGOLE:
- Cita SEMPRE articoli di legge e riferimenti normativi specifici
- Indica SEMPRE la giurisprudenza rilevante con numero sentenza, anno, organo
- Usa linguaggio tecnico-giuridico preciso
- Quando analizzi una causa, fornisci percentuale stimata di successo
- Per i termini processuali, calcola includendo sospensione feriale (1-31 agosto)
- Per le parcelle, applica i parametri DM 55/2014 aggiornati
- Segnala SEMPRE eventuali rischi o criticità
- Rispondi in italiano salvo diversa richiesta`

export class CoreMindEngine {
  private config: CoreMindConfig
  private studioId: string
  private profiloId: string

  constructor(studioId: string, profiloId: string, config?: Partial<CoreMindConfig>) {
    this.studioId = studioId
    this.profiloId = profiloId
    this.config = {
      model: config?.model || AI_CONFIG.model,
      maxTokens: config?.maxTokens || AI_CONFIG.maxTokens,
      temperature: config?.temperature || AI_CONFIG.temperature,
    }
  }

  async chat(
    messages: CoreMindMessage[],
    context?: {
      fascicoloId?: string
      tipo?: string
      systemPromptExtra?: string
    }
  ): Promise<CoreMindResponse> {
    const startTime = Date.now()

    const systemPrompt = context?.systemPromptExtra
      ? `${SYSTEM_PROMPT_BASE}\n\n${context.systemPromptExtra}`
      : SYSTEM_PROMPT_BASE

    let fascicoloContext = ''
    if (context?.fascicoloId) {
      fascicoloContext = await this.loadFascicoloContext(context.fascicoloId)
    }

    const fullSystemPrompt = fascicoloContext
      ? `${systemPrompt}\n\nCONTESTO FASCICOLO CORRENTE:\n${fascicoloContext}`
      : systemPrompt

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: fullSystemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    const data = await response.json()
    const latencyMs = Date.now() - startTime

    const result: CoreMindResponse = {
      content: data.content?.[0]?.text || data.error?.message || 'Errore nella risposta AI',
      tokensIn: data.usage?.input_tokens || 0,
      tokensOut: data.usage?.output_tokens || 0,
      model: data.model || this.config.model,
      latencyMs,
    }

    await this.logUsage(result.tokensIn, result.tokensOut)

    return result
  }

  async analisiPredittiva(fascicoloId: string): Promise<CoreMindResponse> {
    return this.chat(
      [{ role: 'user', content: 'Esegui un\'analisi predittiva completa dell\'esito di questa causa. Valuta: fondatezza delle pretese, solidità probatoria, orientamento giurisprudenziale prevalente, punti di forza e debolezza, probabilità di successo percentuale per ogni scenario.' }],
      {
        fascicoloId,
        tipo: 'analisi_predittiva',
        systemPromptExtra: `Struttura la risposta in:
1. VALUTAZIONE COMPLESSIVA (percentuale successo)
2. PUNTI DI FORZA
3. CRITICITÀ E RISCHI
4. GIURISPRUDENZA RILEVANTE (min 5 sentenze)
5. STRATEGIA RACCOMANDATA
6. SCENARI POSSIBILI con probabilità`,
      }
    )
  }

  async redigiAtto(fascicoloId: string, tipoAtto: string, istruzioni?: string): Promise<CoreMindResponse> {
    return this.chat(
      [{ role: 'user', content: `Redigi un ${tipoAtto} per questo fascicolo.${istruzioni ? ' Istruzioni: ' + istruzioni : ''} L'atto deve essere completo, formalmente corretto, con citazione di normativa e giurisprudenza pertinente.` }],
      {
        fascicoloId,
        tipo: 'redazione_atto',
        systemPromptExtra: `Stai redigendo un atto giudiziario formale. Rispetta:
- Intestazione con Tribunale/Autorità, RG, parti
- Struttura formale con PREMESSO, FATTO, DIRITTO, CONCLUSIONI
- Citazione precisa di articoli di legge
- Giurisprudenza a supporto con riferimenti completi
- Linguaggio tecnico-giuridico formale`,
      }
    )
  }

  async ricercaGiurisprudenza(query: string, materia?: string, fascicoloId?: string): Promise<CoreMindResponse> {
    return this.chat(
      [{ role: 'user', content: `Ricerca giurisprudenziale: "${query}"${materia ? ' (materia: ' + materia + ')' : ''}. Trova i precedenti più rilevanti e analizza l'orientamento prevalente.` }],
      {
        fascicoloId,
        tipo: 'ricerca_giurisprudenza',
        systemPromptExtra: `Per ogni sentenza indica: Organo, sezione, numero, data, massima, rilevanza percentuale. Alla fine fornisci orientamento prevalente e raccomandazioni.`,
      }
    )
  }

  async analisiContratto(contenutoContratto: string): Promise<CoreMindResponse> {
    return this.chat(
      [{ role: 'user', content: `Analizza questo contratto:\n\n${contenutoContratto}\n\nIdentifica: clausole vessatorie, rischi legali, incompatibilità normative, clausole mancanti, suggerimenti di modifica.` }],
      {
        tipo: 'analisi_contratto',
        systemPromptExtra: `Analisi contrattuale professionale. Struttura:
1. OVERVIEW CONTRATTO
2. CLAUSOLE CRITICHE (con riferimento normativo)
3. CLAUSOLE VESSATORIE ex art. 33-36 D.Lgs. 206/2005
4. CLAUSOLE NULLE O ANNULLABILI
5. CLAUSOLE MANCANTI RACCOMANDATE
6. SUGGERIMENTI DI MODIFICA`,
      }
    )
  }

  async calcoloTermini(fascicoloId: string, evento?: string): Promise<CoreMindResponse> {
    return this.chat(
      [{ role: 'user', content: `Calcola tutti i termini processuali rilevanti${evento ? ' a partire dall\'evento: ' + evento : ''}. Includi sospensione feriale (1-31 agosto).` }],
      {
        fascicoloId,
        tipo: 'calcolo_termini',
        systemPromptExtra: `Per ogni termine indica: Tipo (perentorio/ordinatorio), Riferimento normativo, Data inizio, Giorni, Sospensione feriale, Data scadenza finale, Giorni rimanenti.`,
      }
    )
  }

  async assistenteUdienza(fascicoloId: string, noteUdienza: string): Promise<CoreMindResponse> {
    return this.chat(
      [{ role: 'user', content: `Assistenza udienza. Note: ${noteUdienza}. Suggerisci eccezioni, precedenti da citare, strategie, domande per testimoni.` }],
      {
        fascicoloId,
        tipo: 'assistente_udienza',
        systemPromptExtra: `Risposte CONCISE e OPERATIVE:
- ECCEZIONI DA SOLLEVARE
- PRECEDENTI DA CITARE (max 3)
- STRATEGIA SUGGERITA
- DOMANDE SUGGERITE
- POSSIBILI OBIEZIONI CONTROPARTE`,
      }
    )
  }

  private async loadFascicoloContext(fascicoloId: string): Promise<string> {
    const { data: fascicolo } = await supabase
      .from('fascicoli')
      .select(`
        *,
        fascicolo_parti(*, soggetti(*)),
        atti(id, tipo, titolo, stato, data_deposito),
        udienze(id, tipo, data_udienza, esito, note_udienza),
        scadenze(id, tipo, titolo, data_scadenza, stato),
        fascicolo_eventi(id, tipo, titolo, data_evento)
      `)
      .eq('id', fascicoloId)
      .single()

    if (!fascicolo) return ''

    return `
FASCICOLO: ${fascicolo.numero_interno} (RG: ${fascicolo.numero_rg || 'N/A'})
MATERIA: ${fascicolo.materia} ${fascicolo.sotto_materia ? '- ' + fascicolo.sotto_materia : ''}
OGGETTO: ${fascicolo.oggetto}
STATO: ${fascicolo.stato} | FASE: ${fascicolo.fase || 'N/A'}
VALORE CAUSA: ${fascicolo.valore_causa ? '€' + fascicolo.valore_causa : 'N/A'}
AUTORITÀ: ${fascicolo.autorita_giudiziaria || 'N/A'} ${fascicolo.sezione || ''}
GIUDICE: ${fascicolo.giudice || 'N/A'}

PARTI:
${fascicolo.fascicolo_parti?.map((p: any) =>
  `- ${p.ruolo}: ${p.soggetti?.display_name} (CF: ${p.soggetti?.codice_fiscale || 'N/A'})`
).join('\n') || 'Nessuna parte registrata'}

ATTI:
${fascicolo.atti?.map((a: any) =>
  `- [${a.stato}] ${a.tipo}: ${a.titolo}`
).join('\n') || 'Nessun atto'}

UDIENZE:
${fascicolo.udienze?.map((u: any) =>
  `- ${u.data_udienza}: ${u.tipo} — Esito: ${u.esito || 'da svolgere'}`
).join('\n') || 'Nessuna udienza'}

SCADENZE ATTIVE:
${fascicolo.scadenze?.filter((s: any) => s.stato === 'attiva').map((s: any) =>
  `- ${s.data_scadenza}: ${s.titolo} [${s.tipo}]`
).join('\n') || 'Nessuna scadenza attiva'}

DESCRIZIONE: ${fascicolo.descrizione || 'N/A'}`
  }

  private async logUsage(tokensIn: number, tokensOut: number): Promise<void> {
    if (!tokensIn && !tokensOut) return
    const today = new Date().toISOString().split('T')[0]
    const costoStimato = (tokensIn * AI_CONFIG.costPerInputToken + tokensOut * AI_CONFIG.costPerOutputToken)

    try {
      await supabase.rpc('increment_ai_usage', {
        p_studio_id: this.studioId,
        p_profilo_id: this.profiloId,
        p_data: today,
        p_tokens_in: tokensIn,
        p_tokens_out: tokensOut,
        p_costo: costoStimato,
      })
    } catch {
      // Usage logging is non-critical
    }
  }
}
