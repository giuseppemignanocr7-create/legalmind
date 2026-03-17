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

    const { documento_id, storage_path, studio_id } = await req.json()

    if (!documento_id || !storage_path) {
      return new Response(JSON.stringify({ error: 'documento_id and storage_path required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documenti')
      .download(storage_path)

    if (downloadError) throw downloadError

    // Convert to base64 for OCR processing
    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // Use Anthropic Claude for OCR (vision capabilities)
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    let extractedText = ''
    let confidence = 0.0

    if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: [{
              type: 'image',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 }
            }, {
              type: 'text',
              text: 'Estrai tutto il testo da questo documento legale. Mantieni la formattazione originale il più possibile. Identifica sezioni, titoli, parti, date e importi. Restituisci il testo estratto in formato strutturato.'
            }]
          }]
        })
      })

      if (response.ok) {
        const result = await response.json()
        extractedText = result.content[0]?.text || ''
        confidence = 0.92
      }
    }

    // Fallback: basic text extraction info
    if (!extractedText) {
      extractedText = `[OCR non disponibile - configurare ANTHROPIC_API_KEY]\nDocumento: ${storage_path}\nDimensione: ${arrayBuffer.byteLength} bytes`
      confidence = 0.0
    }

    // Save OCR results
    const { data: ocrResult, error: insertError } = await supabase
      .from('ocr_results')
      .insert({
        documento_id,
        studio_id,
        testo_estratto: extractedText,
        confidence,
        metadata: {
          engine: anthropicKey ? 'claude-vision' : 'none',
          file_size: arrayBuffer.byteLength,
          processing_time_ms: Date.now(),
        }
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(JSON.stringify({
      success: true,
      ocr_id: ocrResult.id,
      text_length: extractedText.length,
      confidence,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
