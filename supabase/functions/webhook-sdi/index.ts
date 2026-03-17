import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const { event_type, identificativo_sdi, fattura_id, stato, motivo_rifiuto, ricevuta_xml } = payload

    // Log webhook
    await supabase.from('webhook_log').insert({
      source: 'sdi',
      event_type,
      payload,
      headers: Object.fromEntries(req.headers.entries()),
      status_code: 200,
    })

    if (!identificativo_sdi && !fattura_id) {
      return new Response(JSON.stringify({ error: 'identificativo_sdi or fattura_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Map SdI events to tracking states
    const statoMap: Record<string, string> = {
      'RC': 'consegnata',        // Ricevuta di Consegna
      'NE': 'errore',            // Notifica di Esito (cedente)
      'MC': 'decorrenza_termini', // Mancata Consegna
      'NS': 'rifiutata',        // Notifica di Scarto
      'DT': 'decorrenza_termini', // Decorrenza Termini
      'AT': 'accettata',        // Attestazione di Avvenuta Trasmissione
      'EC01': 'accettata',      // Esito Committente - Accettata
      'EC02': 'rifiutata',      // Esito Committente - Rifiutata
    }

    const newStato = statoMap[event_type] || stato || 'consegnata'

    // Update SdI tracking
    const updateData: Record<string, unknown> = {
      stato: newStato,
      updated_at: new Date().toISOString(),
    }

    if (ricevuta_xml) updateData.ricevuta_xml = ricevuta_xml
    if (newStato === 'consegnata') updateData.data_consegna = new Date().toISOString()
    if (newStato === 'accettata') updateData.data_accettazione = new Date().toISOString()
    if (newStato === 'rifiutata') {
      updateData.data_rifiuto = new Date().toISOString()
      updateData.motivo_rifiuto = motivo_rifiuto || 'Non specificato'
    }

    let query = supabase.from('sdi_tracking').update(updateData)
    if (identificativo_sdi) query = query.eq('identificativo_sdi', identificativo_sdi)
    else query = query.eq('fattura_id', fattura_id)

    const { error: updateError } = await query
    if (updateError) throw updateError

    // Get studio_id for notification
    const { data: tracking } = await supabase
      .from('sdi_tracking')
      .select('studio_id, fattura_id')
      .or(`identificativo_sdi.eq.${identificativo_sdi},fattura_id.eq.${fattura_id}`)
      .single()

    if (tracking) {
      // Create notification
      const { data: titolare } = await supabase
        .from('profili')
        .select('id')
        .eq('studio_id', tracking.studio_id)
        .eq('ruolo', 'titolare')
        .single()

      if (titolare) {
        const notifMessages: Record<string, string> = {
          'consegnata': '✅ Fattura consegnata al destinatario via SdI',
          'accettata': '✅ Fattura accettata dal destinatario',
          'rifiutata': `❌ Fattura rifiutata: ${motivo_rifiuto || 'vedi dettagli'}`,
          'errore': '⚠️ Errore SdI — verificare la fattura',
          'decorrenza_termini': '⏰ Decorrenza termini SdI — fattura considerata accettata',
        }

        await supabase.from('notifiche_inapp').insert({
          studio_id: tracking.studio_id,
          destinatario_id: titolare.id,
          tipo: 'sistema',
          titolo: `SdI: ${notifMessages[newStato] || 'Aggiornamento stato'}`,
          messaggio: `ID SdI: ${identificativo_sdi || 'N/A'}`,
          link: '/contabilita/fatturazione',
        })
      }
    }

    // Mark webhook as processed
    await supabase.from('webhook_log').update({
      processed: true,
      processed_at: new Date().toISOString(),
      response: { stato: newStato },
    }).eq('source', 'sdi').eq('processed', false).order('created_at', { ascending: false }).limit(1)

    return new Response(JSON.stringify({ success: true, stato: newStato }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
