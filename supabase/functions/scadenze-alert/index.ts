import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const in3days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
    const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    // Get upcoming scadenze
    const { data: scadenze, error } = await supabase
      .from('scadenze')
      .select(`
        *,
        fascicoli(numero_interno, oggetto),
        profili!assegnato_a(id, nome, cognome, email_personale)
      `)
      .eq('stato', 'attiva')
      .lte('data_scadenza', in7days)
      .order('data_scadenza', { ascending: true })

    if (error) throw error

    const alerts = []

    for (const s of scadenze || []) {
      let urgenza = 'info'
      let shouldAlert = false

      if (s.data_scadenza === today) {
        urgenza = 'critica'
        shouldAlert = true
      } else if (s.data_scadenza === tomorrow) {
        urgenza = 'alta'
        shouldAlert = true
      } else if (s.data_scadenza <= in3days) {
        urgenza = 'alta'
        shouldAlert = s.urgenza === 'critica' || s.urgenza === 'alta'
      } else if (s.data_scadenza <= in7days) {
        urgenza = 'media'
        shouldAlert = s.urgenza === 'critica'
      }

      // Check if alert already sent today
      const alertsSent = s.alert_inviati || []
      const alreadySentToday = alertsSent.some(
        (a: any) => a.data === today && a.tipo === urgenza
      )

      if (shouldAlert && !alreadySentToday) {
        // Record alert
        const newAlerts = [...alertsSent, { data: today, tipo: urgenza, canale: 'push' }]
        await supabase
          .from('scadenze')
          .update({ alert_inviati: newAlerts })
          .eq('id', s.id)

        alerts.push({
          scadenza_id: s.id,
          titolo: s.titolo,
          fascicolo: s.fascicoli?.numero_interno,
          data_scadenza: s.data_scadenza,
          urgenza,
          assegnato_a: s.profili?.email_personale,
        })
      }
    }

    // Mark overdue scadenze
    await supabase
      .from('scadenze')
      .update({ stato: 'scaduta' })
      .eq('stato', 'attiva')
      .lt('data_scadenza', today)

    return new Response(
      JSON.stringify({ success: true, alerts_sent: alerts.length, alerts }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
