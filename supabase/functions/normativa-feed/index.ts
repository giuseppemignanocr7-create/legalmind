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

    // Fetch latest normativa from configured sources
    // This is a scheduled function that runs daily
    const sources = [
      { name: 'Gazzetta Ufficiale', url: 'https://www.gazzettaufficiale.it/rss/GU.xml', fonte: 'gazzetta_ufficiale' },
    ]

    const results = []

    for (const source of sources) {
      try {
        const response = await fetch(source.url)
        if (!response.ok) continue

        const xml = await response.text()
        // Basic RSS parsing - in production use a proper XML parser
        const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []

        for (const item of items.slice(0, 10)) {
          const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || ''
          const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.trim() || ''
          const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || ''
          const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || ''

          if (title) {
            const { error } = await supabase.from('normativa_feed').upsert({
              fonte: source.fonte,
              area: 'civile', // Would be classified by AI in production
              severita: 'informativa',
              titolo: title.replace(/<!\[CDATA\[|\]\]>/g, ''),
              sintesi: description.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, ''),
              url_fonte: link.replace(/<!\[CDATA\[|\]\]>/g, ''),
              data_pubblicazione: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            }, { onConflict: 'titolo' })

            if (!error) results.push(title)
          }
        }
      } catch {
        // Skip failed sources
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
